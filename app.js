require("dotenv").config();
const baseurl = "/";
const express = require('express');
const puppeteer = require('puppeteer')
const {writeFile} = require('fs-extra');
const port = 3800;
const app =express();
const cors=require("cors");
app.use(cors({
  "origin":"*",
  "credentials":true,
  "optionSucessstatus":200
}));

app.use(express.json({limit: '50mb'}));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', "*");
    res.header('Access-Control-Allow-Methods','GET,PUT,POST,PATCH,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
})

app.get("/", (req, res)=>{
    res.json({
        success:1,
        message :"this is rest apis working"
    })
})

app.post("/url2img", async (req, res)=>{
    const browser = await puppeteer.launch();
            const page = await browser.newPage();
            await page.setViewport({
                width: req.body.width,
                height: req.body.height
            });

            //question id split
            //let splitqid = req.body.url.split("=");
            //let qid = splitqid[1];

            // If your HTML is saved to a file, you load it like this:
            await page.goto(req.body.url, {
                timeout: 20000,
                waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']
            });
            //let grid = await page.waitForNavigation();
            // if your HTML is in memory (as a string), you load it like this:
            // page.setContent(htmlString);

            const imageBuffer = await page.screenshot({});

            await browser.close();

            // write file to disk as buffer
            //await writeFile(qid+'.jpg', imageBuffer);

            // convert to base64 string if you want to:
            //console.log(imageBuffer.toString('base64'));
            let finalres = {"data" : imageBuffer.toString('base64')}
            res.json(finalres)
})

app.listen(port, ()=>{
    console.log(`Server up and running on port : http://localhost:${port}`)
})