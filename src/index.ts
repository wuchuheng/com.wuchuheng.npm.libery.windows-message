import { logger } from "./logger"

type ChannelMsg<T> = {
  success: boolean
  channel: string
  isSetup?: boolean
  data: T
  error?: { msg: string; stack: string }
}

type CreateChannelReturn<Req, Res> = {
  request: (message: Req, windowObj: Window) => Promise<Res>
  handle: (callback: (req: Req) => Promise<Res>) => void
}

/**
 * Create a channel to communicate with the window.
 * @param channel - The channel to create.
 * @returns The request and handle functions.
 */
export const createChannel = <Req, Res>(
  channel: string
): CreateChannelReturn<Req, Res> => {
  const requestChannel = `request:/${channel}`
  const responseChannel = `response:/${channel}`

  // 2. Handle logic.
  // 2.1 Check if the channel is setup.
  let isSetup = false

  // 2.1 Access the setup message from child window.
  const processSetupMsg = () =>
    new Promise<void>((resolve) => {
      const onMessage = (event: MessageEvent) => {
        // 1. Handle logic.
        if (event.origin !== window.location.origin) {
          return
        }

        const channelMsg = event.data as ChannelMsg<Req>
        if (channelMsg.channel !== requestChannel) {
          return
        }
        if (channelMsg.isSetup) {
          isSetup = true
          window.removeEventListener("message", onMessage)
          resolve()
          logger.log(`[windows message: request side]: setup success`)
          return
        }
      }
      window.addEventListener("message", onMessage)
    })

  processSetupMsg()

  const waitChildWindowSetup = async () => {
    // 2. Handle logic.
    if (isSetup) {
      return
    }
    await processSetupMsg()
  }

  // 3. Return the result.
  return {
    request: (message: Req, windowObj: Window = window) =>
      request(
        message,
        windowObj,
        responseChannel,
        requestChannel,
        waitChildWindowSetup
      ),

    handle: (callback: (req: Req) => Promise<Res>) =>
      handle(callback, requestChannel, responseChannel)
  }
}

/**
 * Handle the request from the window.
 * @param callback - The callback to handle the request.
 */
const handle = <Req, Res>(
  callback: (req: Req) => Promise<Res>,
  requestChannel: string,
  responseChannel: string
) => {
  // 2. Handle logic.
  // 2.1 Send setup message to parent window.
  const setupMsg: ChannelMsg<Req> = {
    channel: requestChannel,
    success: true,
    isSetup: true,
    data: undefined as unknown as Req
  }
  window.parent.postMessage(setupMsg)
  logger.log(
    `[windows message: handle side]: setup: ${JSON.stringify(setupMsg)}`
  )

  const messageHandler = (event: MessageEvent) => {
    // 1. Handle logic.
    if (event.origin !== window.location.origin) {
      return
    }

    const channelMsg = event.data as ChannelMsg<Req>
    if (channelMsg.channel !== requestChannel) {
      return
    }
    
    // Skip setup messages - they are not actual requests
    if (channelMsg.isSetup) {
      return
    }
    
    logger.log(
      `[windows message: handle side]: Receive ${JSON.stringify(channelMsg)} `
    )

    // 2. Handle logic.
    callback(channelMsg.data)
      .then((res) => {
        const msg: ChannelMsg<Res> = {
          channel: responseChannel,
          success: true,
          data: res
        }

        event.source?.postMessage(msg, { targetOrigin: event.origin })

        logger.log(
          `[windows message: handle side]: Post ${JSON.stringify(msg)} `
        )
      })
      .catch((err) => {
        const errMsg: ChannelMsg<Res> = {
          channel: responseChannel,
          success: false,
          data: undefined as unknown as Res,
          error: {
            msg: err.message,
            stack: err.stack || ""
          }
        }
        event.source?.postMessage(errMsg, { targetOrigin: event.origin })
        logger.error(
          `[windows message: handle side]: Post ${JSON.stringify(errMsg)} `
        )
      })
      // Keep the handler active for multiple requests - don't remove listener
  }

  // 2.2 Listen to message from parent window.
  window.addEventListener("message", messageHandler)
}

/**
 * Request the message to the window.
 * @param message - The message to request.
 * @returns The response from the window.
 */
const request = async <Req, Res>(
  message: Req,
  windowObj: Window = window,
  responseChannel: string,
  requestChannel: string,
  waitChildWindowSetup: () => Promise<void>
): Promise<Res> => {
  // 2. Handle logic.
  await waitChildWindowSetup()

  // 2.2 Send message to child window.
  return new Promise<Res>((resolve, reject) => {
    const messageHandler = (event: MessageEvent) => {
      // 1. Handle input.
      if (event.origin !== window.location.origin) {
        return
      }
      // 1.2 If the channel is not the same, return.
      const channelMsg = event.data as ChannelMsg<Res>
      if (channelMsg.channel !== responseChannel) {
        return
      }

      // 2. Handle logic.
      logger.log(
        `[windows message: request side]: Receive ${JSON.stringify(channelMsg)} `
      )
      if (channelMsg.success) {
        resolve(channelMsg.data)
      } else {
        reject(channelMsg.error?.msg || "Unknown error")
        console.error(channelMsg.error?.msg)
        console.error(channelMsg.error?.stack)
      }

      // 3. Remove the listener.
      window.removeEventListener("message", messageHandler)
    }

    window.addEventListener("message", messageHandler)

    const msg: ChannelMsg<Req> = {
      channel: requestChannel,
      success: true,
      data: message
    }

    logger.log(`[windows message: request side]: Post ${JSON.stringify(msg)} `)
    windowObj.postMessage(msg, "*")
  })
}
