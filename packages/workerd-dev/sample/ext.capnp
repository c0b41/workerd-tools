using Workerd = import "/workerd/workerd.capnp";

const fooExtension :Workerd.Extension = (
  modules = [
    # this module will be directly importable by the user
    ( name = "foo:secret", esModule = embed "foo-secret.js", internal = true ),
    ( name = "foo:int", esModule = embed "foo-int.js", internal = true ),
    ( name = "foo:bind", esModule = embed "foo.js", internal = true )
  ]
);