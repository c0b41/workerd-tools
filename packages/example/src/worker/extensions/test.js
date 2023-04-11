import { Foo, secret } from 'foo:bar'

function Yolo(env) {

    return {
        message: () => {
            Foo(secret)

        },
        message2: () => {
            console.log(`Binding ${env.bar}`)
        }
    }

}
export {
    Yolo
}