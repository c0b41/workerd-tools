export default {
    async fetch(req, env) {
        console.log(req.method)
        console.log(req.url)

        //env.foooo.message()
        //env.foooo.message2()
        return new Response("Hello Wor222ld\n");
    }
};