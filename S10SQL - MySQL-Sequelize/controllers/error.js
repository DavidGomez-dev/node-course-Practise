exports.get404 = (req, res) => {
  //res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  res
    .status(404)
    .render("404", { pageTitle: "404 Page not Found", path: "/404" });
};
