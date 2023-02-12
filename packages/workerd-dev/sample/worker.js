export default {
    async fetch(req, env) {
        console.log(req.method)
        console.log(req.url)
        //throw new Error('Hi')
        return new Response("Hello World888\n", {
            status: 200,
            headers: {
                "content-type": "text/html; charset=utf-8",
            }
        });
    }
};