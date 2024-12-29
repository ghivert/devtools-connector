import lustre/effect.{type Effect}

@external(javascript, "./devtools.ffi.mjs", "init")
fn do_init(state: state) -> Nil

pub fn init(next: fn() -> #(model, Effect(msg))) -> #(model, Effect(msg)) {
  let #(state, effects) = next()
  do_init(state)
  #(state, effects)
}

@external(javascript, "./devtools.ffi.mjs", "send")
fn do_send(state: state, action: msg) -> Nil

pub fn send(
  msg: msg,
  next: fn() -> #(model, Effect(msg)),
) -> #(model, Effect(msg)) {
  let #(state, effects) = next()
  do_send(state, msg)
  #(state, effects)
}
