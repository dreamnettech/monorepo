
const kue = require('kue-scheduler')
const JobMaker = require('./JobMaker')
const JobRegister = require('./JobRegister')

/**
 * Main queue driver
 *
 * @version 2.0.0
 * @adonis-version 4.0+
 */
class Queue {
  /**
   * Construct the queue
   * @param  {Adonis/App} app Adonis app/Ioc instance
   */
  constructor(app) {
    // inject the app instance
    this._app = app
    // initialize adonis logic
    this._config = this._app.use('Adonis/Src/Config')
    this._helpers = this._app.use('Adonis/Src/Helpers')
    //
    this._queue = null
  }

  /**
   *
   */
  start() {
    if (this._queue) {
      return this
    }

    // initialize kue queue
    this._queue = kue.createQueue(this._config.get('queue.connection'))
    // boost number of event listeners a queue instance can listen to
    this._queue.setMaxListeners(0)

    return this
  }

  /**
   *
   */
  shutdown() {
    this._queue.shutdown()
    this._queue = null

    console.log('shutdown!')
  }

  /**
   * Register job event handlers
   * @return {Promise}
   */
  processing() {
    this.start()

    const register = new JobRegister(this._config, this._helpers)
    return register.setQueue(this._queue).listenForAppJobs()
  }

  /**
   * Dispatch a new job
   * @param  {App/Jobs} job Job instances
   * @return {Void}
   */
  dispatch(job, when = 'now', shutdownAfter = null) {
    this.start()

    if (shutdownAfter === null) {
      shutdownAfter = this._helpers.isAceCommand()
    }

    // create a job maker factory
    const maker = new JobMaker()

    // get the kue job converted from app job
    const kueJob = maker.setAppJob(job)
      .setQueue(this._queue)
      .process()
      .getFinalJob()

    const onDispatchDone = (error, job) => {
      if (shutdownAfter) {
        this.shutdown()
      }
    }

    // schedule the job in the queue
    if (when === 'now') {
      // immediate job
      this._queue.now(kueJob, onDispatchDone)
    } else if (when.includes('every') || when.includes('*')) {
      when = when.replace('every ', '')
      // cron or repeating job
      this._queue.every(when, kueJob, onDispatchDone)
    } else {
      // schedule a job
      this._queue.schedule(when, kueJob, onDispatchDone)
    }
  }

  /**
   * Remove a job from queue
   * @param  {App/Job} job Job producer
   * @return {Promise<Response>}
   */
  remove(job) {
    this.start()

    return new Promise((resolve, reject) => {
      this._queue.remove(job._kueJob.id, (error, response) => {
        if (error) {
          reject(error)
        } else {
          // send the onRemove event
          if (job.onRemove) {
            job.onRemove(job.type)
          }
          resolve(response)
        }
      })
    })
  }

  /**
   * Clear all jobs within a queue for a clean start
   * @return {Promise<Response>}
   */
  clear() {
    this.start()

    return new Promise((resolve, reject) => {
      this._queue.clear((error, response) => {
        if (error) {
          reject(error)
        } else {
          resolve(response)
        }
      })
    })
  }
}

module.exports = Queue
