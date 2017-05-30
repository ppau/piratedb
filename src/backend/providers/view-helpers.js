/**
 * Wraps the routed view function to enforce json request/responses.
 * @param fn
 * @returns {checkHeaders}
 **/
function json(fn) {
  return async function checkHeaders(ctx, next) {
    if (!ctx.is("application/json")) {
      ctx.throw(400, "Request body must be of type application/json")
    }

    if (!ctx.accepts("json")) {
      ctx.throw(406, "This resource only responds with application/json")
    }

    return await fn(ctx, next)
  }
}

class RequestError extends Error {
  constructor(message, fields){
    super(message)
    this.fields = fields
  }

  getErrors(){
    return [
      this.message,
    ]
  }

  getFieldErrors(){
    return this.fields
  }
}

module.exports = { json, RequestError }
