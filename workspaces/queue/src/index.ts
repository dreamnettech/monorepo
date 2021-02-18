import EventEmitter from 'events'
import { take, merge, reject, debounce, DebouncedFunc } from 'lodash'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Callback = (...args: unknown[]) => Promise<unknown>

export interface QueueOptions {
  concurrent?: number
  delay?: number
  start?: boolean
  retry?: boolean
}

export interface TaskData {
  id: number
  task: unknown
}

export function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export class Queue extends EventEmitter {
  public fn: Callback

  public options: QueueOptions = {
    concurrent: 1,
    delay: 500,
    start: true,
    retry: false,
  }

  public started = false

  public working = false

  public work: DebouncedFunc<() => Promise<void>>

  public tasks: TaskData[] = []

  public nextTaskID = -1

  public get isEmpty(): boolean {
    return this.tasks.length === 0
  }

  public constructor(fn: Callback, options: QueueOptions = {}) {
    super()

    this.fn = fn
    this.options = merge(this.options, options)

    this.work = debounce(this._work.bind(this), this.options.delay)

    if (this.options.start) {
      this.start()
    }
  }

  public start(): void {
    if (this.started) {
      return
    }

    this.started = true

    this.emit('started')

    this.work()
  }

  public pause(): void {
    if (!this.started) {
      return
    }

    this.started = false

    this.emit('paused')
  }

  public stop(): void {
    if (!this.started) {
      return
    }

    this.started = false

    this.clear()

    this.emit('stopped')
  }

  public clear(): void {
    this.tasks.forEach((task) => {
      this.emit('task:dropped', task)
    })

    this.tasks = []

    this.emit('finished')
  }

  protected async _work(): Promise<void> {
    if (!this.started) {
      return
    }

    if (this.working) {
      return
    }

    if (this.isEmpty) {
      return
    }

    this.working = true

    do {
      if (this.options.delay) {
        await wait(this.options.delay)
      }

      const workload: Promise<unknown>[] = []

      const tasks = take(this.tasks, this.options.concurrent)

      tasks.forEach((data) => {
        this.emit('task:started', data)

        workload.push(
          Promise.resolve(this.fn(data.task))
          .then((value: unknown) => {
            this.emit('task:success', data, value)
          })
          .catch((error) => {
            this.emit('task:failed', data, error)

            if (this.options.retry) {
              this.add(data.task)
            }
          })
          .finally(() => {
            this.drop(data.id)
          }),
        )
      })

      await Promise.all(workload)
    } while (this.started && !this.isEmpty)

    this.working = false

    this.emit('finished')
    this.emit('empty')
  }

  public add(task: unknown): number {
    this.nextTaskID += 1

    const data = {
      id: this.nextTaskID,
      task,
    }

    this.tasks.push(data)

    this.emit('task:added', data)

    this.work()

    return this.nextTaskID
  }

  public drop(id: number): void {
    this.tasks = reject(this.tasks, { id })
  }
}