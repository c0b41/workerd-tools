import { message } from "foo:int";

function makeBinding(env) {
    //
    return {
        log: () => {
            console.log(env.yolo)
            console.log(message)
        }
    }
}

export default makeBinding;