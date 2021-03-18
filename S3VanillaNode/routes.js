const fs = require("fs");

module.exports = requestHandler = (req, res) => {
  const { url, method } = req;
  if (url === "/") {
    res.setHeader("Content-Type", "text/html");
    res.write("<html>");
    res.write("<head><title>Hello World</title></head>");
    res.write("<body><h1>Hello World</h1></body>");
    res.write(
      "<form action='/message' method='POST'><input type='text' name='message'><button type='submit'>Send</button></form>"
    );
    res.write("</html>");
    return res.end();
  } else if (url === "/message" && method === "POST") {
    const body = [];
    req.on("data", (chunk) => {
      console.log(chunk);
      body.push(chunk);
    });

    req.on("end", () => {
      console.log(body);
      const parsedBody = Buffer.concat(body).toString();
      console.log(parsedBody);
      const message = parsedBody.split("=")[1];
      fs.writeFile("file.txt", message, (err) => {
        console.log(err);
      });
    });

    // res.setHeader("Content-Type", "text/html");
    // res.write("<html>");
    // res.write("<head><title>Hello World</title></head>");
    // res.write(`<body><h1>Your message is </h1></body>`);
    // res.write("</html>");
    res.statusCode = 302;
    res.setHeader("Location", "/");
    return res.end();
  }
};

//module.exports = requestHandler;
