export default {
    async fetch(req, env) {
        console.log(req.method)
        console.log(req.url)
        return new Response("Hello Wor222ld\n");
    }
};