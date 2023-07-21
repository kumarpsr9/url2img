require("dotenv").config();
const baseurl = "/";
const express = require('express');
const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');
const {writeFile} = require('fs-extra');
const port = 3000;
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

function fileExists(filePath) {
    try {
      fs.accessSync(filePath, fs.constants.F_OK);
      return true;
    } catch (error) {
      return false;
    }
  }

app.post("/url2img", async (req, res)=>{
   
    const browser = await puppeteer.launch({
        headless: "new",
        args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"],
        defaultViewport: { width: 1920, height: 1080 },
        env: {
          TZ: "ASIA/KOLKATA",
          NODE_OPTIONS: "--max-old-space-size=4096",
        },
      });
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

app.post("/url2pdf", async (req, res)=>{

    // const url = req.body.url+"?papercode="+req.body.papercode+"&prgmId="+req.body.prgmId; 
    // Assuming URL is passed as a query parameter
    try {
        var randval = Math.floor(1000 + Math.random() * 9000);
        var outputFolder = __dirname + '/uploads'+req.body.path || __dirname + '/uploads';
        var uploadPath =  req.body.path || '/' ;
        if (!fs.existsSync(outputFolder)) {
            fs.mkdir(path.join(outputFolder),
                { recursive: true }, (err) => {
                    if (err) {
                        // console.log(err)
                        var finalres = { "msg": "Dirctory not Created" }
                        res.status(500).send(finalres)
                    } else {
                        // console.log('success')
                        return true
                    }
                   
                });
        }
        var format = req.body.format || "A4";
        var filename = req.body.filename || Date.now() + randval;
        var headerLeft = req.body.headerLeft || "";
        var headerRight = req.body.headerRight || "";
        var footerLeft = req.body.footerLeft || "";
        var pageNum = req.body.pageNumbers !== undefined ? req.body.pageNumbers : true;
        var landscape = req.body.landscape !== undefined ? req.body.landscape : false;
        var margin = req.body.margin
        if(margin==undefined){
            var margin = {
                "top": 10,
                "right": 10,
                "bottom": 10,
                "left": 10
            }
        }
        if(headerLeft=="" && headerRight==""){
            var headerTemplate = ""
        } if(headerLeft=="" && headerRight!=""){
            var headerTemplate = `<div style="font-size: 10px; text-align: center; padding-bottom:10px; margin-left:20px;  margin-right:20px; width: 100%; border-bottom:1px solid #000">
            <span style="float:right;">${headerRight}</span>
        </div>`
        }if(headerLeft!="" && headerRight==""){
            var headerTemplate = `<div style="font-size: 10px; text-align: center; padding-bottom:10px; margin-left:20px;  margin-right:20px; width: 100%; border-bottom:1px solid #000">
            <span style="float:left;">${headerLeft}</span>
        </div>`
        } else {
            var headerTemplate = `<div style="font-size: 10px; text-align: center; padding-bottom:10px; margin-left:20px;  margin-right:20px; width: 100%; border-bottom:1px solid #000">
                <span style="float:left;">${headerLeft}</span>
                <span style="float:right;">${headerRight}</span>
            </div>`
        }
        if(pageNum==false  && footerLeft==""){
            var footerTemplate = ""
        } else if(pageNum==false  && footerLeft!="") {
            var footerTemplate = `<div style="font-size: 10px; text-align: center; padding-top:10px; margin-left:20px;  margin-right:20px; width: 100%; border-top:1px solid #000">
            <span style="float:left;">${footerLeft}</span>`
        } else if(pageNum==true  && footerLeft=="") {
            var footerTemplate = `<div style="font-size: 10px; text-align: center; padding-top:10px; margin-left:20px;  margin-right:20px; width: 100%; border-top:1px solid #000">
            <span style="float:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`
        } else {    
            var footerTemplate = `<div style="font-size: 10px; text-align: center; padding-top:10px; margin-left:20px;  margin-right:20px; width: 100%; border-top:1px solid #000">
            <span style="float:left;">${footerLeft}</span>
            <span style="float:right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span>
        </div>`
        }
        const browser = await puppeteer.launch({
            headless: "new",
            args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-setuid-sandbox"],
            // defaultViewport: { width: 1920, height: 1080 },
            // env: {
            //   TZ: "ASIA/KOLKATA",
            //   NODE_OPTIONS: "--max-old-space-size=4096",
            // },
          });
        const page = await browser.newPage();
        await page.goto(req.body.url, {
                timeout: 20000,
                waitUntil: ['load', 'domcontentloaded', 'networkidle0', 'networkidle2']
            });
            // await page.addStyleTag({ content: 'h4 { background-color: #999; }' });  
        const pdfBuffer = await page.pdf({
            format,
            landscape,
            margin,
            printBackground: true,
            displayHeaderFooter: true,
            headerTemplate,
            footerTemplate
         });
        await browser.close();

        res.setHeader('Content-Type', 'application/pdf');
        const filewithmime = filename+'.pdf'; // Generate a unique filename
        const filePath = path.join(outputFolder, filewithmime);

        fs.writeFileSync(filePath, pdfBuffer);
        var finalres = {msg:"success", filename : filewithmime, uploadPath}
        res.status(200).json(finalres);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Error generating PDF' });
    }

})

app.post('/downloadpdf', async (req, res, next) => {
    
    try {
        var filePath = __dirname + '/uploads' + req.body.uploadPath + '/' + req.body.filename;
        const exists = fileExists(filePath);
        if(exists){
            const reqfilePath =  __dirname + '/uploads' + req.body.uploadPath + '/'; // Replace with the actual file path
            // res.sendFile(resdata[0].fileName, {root: filePath});
            const options = {
                root: path.join(reqfilePath)
            };
         
            const fileName = req.body.filename;
            res.sendFile(fileName, options, function (err, result) {
                if (err) {
                    next(err);
                } else {
                    // console.log('test')
                    res.status(500).send(result)
                }
            });
        } else {
            var finalres = { "msg": "File not found" }
            res.status(400).send(finalres)
        }   
    } catch (err) {
        console.log(err);
        var finalres = { "msg": "Internal server error" }
        res.status(500).send(finalres)
    }
});

app.listen(port, ()=>{
    console.log(`Server up and running on port : http://localhost:${port}`)
})