export default {
    async fetch(req, env) {
        console.log(req)
        return new Response("Hello Wor222ld\n");
    }
};