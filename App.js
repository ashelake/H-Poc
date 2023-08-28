/* importing package & local dependencies */
require("dotenv").config();
const fs = require("fs")
const express = require("express"); //use express
const port = process.env.PORT || 9000;
const connectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const credentials = require("./middleware/credentials");
const { errorHandler } = require("./middleware/errorHandler");
connectDB(); //use & connect to MongoDB
const app = express(); //initialize express app
const cors = require("cors");
const corsOptions = require("./config/corsOptions");
const mammoth = require("mammoth")
//#Local files

const Log_Schema = require("./models/Log_Schema")
const Logger_Schema = require("./models/Logger_Schema")
const Room_Schema = require("./models/Room_Schema")
const Room_Trans_Schema = require("./models/Room_Trans_Schema")
const Equipment_Schema = require("./models/Equipment_Schema")
const { signatureUpload } = require("./uploads/signUpload");
const { signFolder } = require("./utils/signStorage");
const { emailTemplate } = require("./utils/emailTemplate")
//////////////////////////////////////////////////
//////////////////////////////////////////////////
const DocumentSchema = require("./models/Document")
const UserSchema = require("./models/Register_Schema")
const NewLogSchema = require("./models/log")
// import { createTransport } from "nodemailer"
const nodemailer = require("nodemailer");
// const createTransport = require("nodemailer");
const createTransport = nodemailer.createTransport;
const pdf = require('pdf-parse');
const multer = require('multer');

// const Equipment_Schema = require("./models/Equipment_Schema")
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//middleware for JSON
// app.use(express.json({limit: '50mb'}));
// app.use(bodyParser.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
//middleware for CORS
app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser()); //middleware for cookies

/* importing local Routes */
const login = require("./routes/Login");
const logout = require("./routes/logout");
const user = require("./routes/Register");
const cloudinary = require("./cloudnary/cloudnary");
const { authenticateToken } = require("./controllers/authenticateToken");

/* importing local Routes base URL points */
app.use("/register", user);
app.use("/login", login);
app.use("/logout", logout);




// app.post('/doc-upload', upload.single('file'), async function (req, res) {

//     let report = {
//         originalname: req.file.originalname,
//         path: req.file.path,
//         upload_date: new Date()
//     }
//     let uploadedFile = await Report.insertMany(report)

//     res.status(200).json(uploadedFile)
// })

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         console.log("1", file)
//         cb(null, './doc/')
//     },
//     filename: (req, file, cb) => {
//         cb(null, file.originalname)
//     },
// });
// const upload = multer({ storage: storage })


// const uploadHtml = async () => {
//     const cpBeforePic = new S3();
//     const param = {
//         Bucket: process.env.AWS_BUCKET_NAME,
//         Key: `edms/${uuid()}.html`,
//         Body: fileContent
//     };
//     return await cpBeforePic.upload(param).promise()
// }

// Configure multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploadedFiles/'); // Save uploaded files in the 'uploads' folder
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname); // Rename files to avoid conflicts
    }
});
const upload = multer({ storage });

app.post("/document-update", authenticateToken, async (req, res, next) => {
    try {

        // await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" }, function (err, result) {
        //     console.log("result", result)
        //     url = result.secure_url
        // })

        const { html, title } = req.body;
        console.log(req.user.email)
        fs.writeFileSync(`./Data/${title}.html`, html);
        const filename = `./Data/${title}.html`
        // const fileContent = fs.readFileSync(filename)
        // let uploadHTML = await uploadHtml(fileContent);
        // url = uploadHTML.Location       
        let newVersion = {
            draft: 1,
            final: 1,
        }
        const new_doc = new DocumentSchema({
            // id: req.body.data.id,
            name: req.body.name, //req.file.originalname,
            file: filename,
            status: 'created',//req.body.status,
            comments: req.body.comments,
            category: req.body.category,
            created_by: req.body.id,
            modified_by: req.body.id,
            created_date: new Date(),
            modified_date: new Date(),
            version: newVersion,
            // comments: req.body.data.comments,
            // reviewer: req.body.data.reviewer,
            // approver: req.body.data.approver,
            // reviewer_date: req.body.data.reviewer_date,
            // approver_date: req.body.data.approver_date,
        })
        const docCreated = await new_doc.save()
        // console.log("docCreated", docCreated)
        if (!docCreated) {
            return res.sendStatus(204)
        } else {
            await sendEmail(req.user?.email, `${docCreated.name} has been Created by ${docCreated.modified_by}`, "Document Created");
            const new_log = new NewLogSchema({
                version: 1,
                doc_name: docCreated.name,
                doc_id: docCreated.id,
                event: "Document Created",
                prev_status: docCreated.status,
                curr_status: docCreated.status,
                created_by: docCreated.created_by,
                executed_by: req.body.id,
                reviewed_by: '',
                created_date: new Date(),
                modified_date: new Date(),
            })
            const logCreated = await new_log.save();
            // const logCreated = await new_log.save();
            return res.status(200).json(docCreated)
        }
    } catch (err) {
        console.log(err);
        next(err)
    }

});
app.get("/get-reviewer", async (req, res) => {
    try {
        let User = await UserSchema.find({ role: 1001 }, { email: 1 })
        res.status(200).json(User)

    } catch (error) {
        res.status(404).json(error)
    }
})
app.get("/get-approver", async (req, res) => {
    try {
        let User = await UserSchema.find({ role: 1000 }, { email: 1 })
        res.status(200).json(User)

    } catch (error) {
        res.status(404).json(error)
    }
})




app.get("/bar-grph", async (req, res) => {
    try {
        let resObject = {

        }

        let department = await DocumentSchema.distinct("department")
        resObject.department = department
        let createdArray = []
        let publishedArray = []
        let wfrArray = []
        let reviewedArray = []
        let wfaArray = []
        let approvedArray = []
        for (let i = 0; i < department.length; i++) {
            let created = await DocumentSchema.find({ status: { $in: ["created", "modified",] }, department: department[i] }).count()
            createdArray.push(created)
            let published = await DocumentSchema.find({ status: "Published", department: department[i] }).count()
            publishedArray.push(published)
            let wfr = await DocumentSchema.find({ status: "waiting_for_review", department: department[i] }).count()
            wfrArray.push(wfr)
            let reviewed = await DocumentSchema.find({ status: "Reviewed", department: department[i] }).count()
            reviewedArray.push(reviewed)
            let wfa = await DocumentSchema.find({ status: "waiting_for_approval", department: department[i] }).count()
            wfaArray.push(wfa)
            let approved = await DocumentSchema.find({ status: "approved", department: department[i] }).count()
            approvedArray.push(approved)
        }



        // let created = await DocumentSchema.aggregate([{ $match: { status: { $in: ["created", "edited",] } } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])
        // let published = await DocumentSchema.aggregate([{ $match: { status: "Published" } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])
        // let wfr = await DocumentSchema.aggregate([{ $match: { status: "waiting_for_review" } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])
        // let reviewed = await DocumentSchema.aggregate([{ $match: { status: "Reviewed" } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])
        // let wfa = await DocumentSchema.aggregate([{ $match: { status: "waiting_for_approval" } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])
        // let approved = await DocumentSchema.aggregate([{ $match: { status: "approved" } },
        // {
        //     $group: {
        //         _id: "$department", // Replace fieldName with the actual field name
        //         count: { $sum: 1 }
        //     }
        // }
        // ])

        // resObject.result.push({ status: "Created", count: created })
        // resObject.result.push({ status: "Waiting for review", count: wfr })
        // resObject.result.push({ status: "Reviewed", count: reviewed })
        // resObject.result.push({ status: "Waiting for approval", count: wfa })
        // resObject.result.push({ status: "Approved", count: approved })
        // resObject.result.push({ status: "Published", count: published })

        resObject.createdArray = createdArray
        resObject.publishedArray = publishedArray
        resObject.wfrArray = wfrArray
        resObject.reviewedArray = reviewedArray
        resObject.wfaArray = wfaArray
        resObject.approvedArray = approvedArray


        res.status(200).json(resObject)

    } catch (error) {
        res.status(404).json(error)
    }
})
app.patch("/doc-update/:id", authenticateToken, async (req, res, next) => {
    try {

        // await cloudinary.uploader.upload(req.file.path, { resource_type: "auto" }, function (err, result) {
        //     console.log("result", result)
        //     url = result.secure_url
        // })
        console.log(req.body.data)
        const { file, title } = req.body.data;
        let DOC = await DocumentSchema.findOne({ _id: req.params.id });
        console.log(DOC.file)
        // let existingContent = fs.readFileSync(`./Data/${DOC.file}`, 'utf8');
        // const updatedContent = file;

        fs.writeFileSync(`${DOC.file}`, file);
        const filename = DOC.file
        // const fileContent = fs.readFileSync(filename)
        // let uploadHTML = await uploadHtml(fileContent);
        // url = uploadHTML.Location       
        let newVersion = {
            draft: 1,
            final: 1,
        }
        const docCreated = await DocumentSchema.findByIdAndUpdate({ _id: req.params.id }, {
            // id: req.body.data.id,
            // name: req.body.name, //req.file.originalname,
            file: filename,
            // status: 'created',//req.body.status,
            comments: req.body.data.comments,
            // category: req.body.category,
            // created_by: req.body.id,
            // modified_by: req.body.id,
            created_date: new Date(),
            modified_date: new Date(),
            // version: newVersion,
            // comments: req.body.data.comments,
            // reviewer: req.body.data.reviewer,
            // approver: req.body.data.approver,
            // reviewer_date: req.body.data.reviewer_date,
            // approver_date: req.body.data.approver_date,
        })
        // const docCreated = await new_doc.save()
        // console.log("docCreated", docCreated)
        if (!docCreated) {
            return res.sendStatus(204)
        } else {
            await sendEmail(req.user.email, `${docCreated.name} has been Edited by ${docCreated.modified_by}`, "Document Edited");
            const new_log = new NewLogSchema({
                version: 1,
                doc_name: docCreated.name,
                doc_id: docCreated.id,
                event: "Document Created",
                prev_status: docCreated.status,
                curr_status: docCreated.status,
                created_by: docCreated.created_by,
                executed_by: req.body.id,
                reviewed_by: '',
                created_date: new Date(),
                modified_date: new Date(),
            })
            const logCreated = await new_log.save();
            // const logCreated = await new_log.save();
            return res.status(200).json(docCreated)
        }
    } catch (err) {
        console.log(err);
        next(err)
    }

});


app.get("/dashboard", async (req, res) => {
    try {
        let resObject = []
        let created = await DocumentSchema.find({ $in: { status: ["created", "modified",] } }).count()
        let published = await DocumentSchema.find({ status: "Published" }).count()
        let wfr = await DocumentSchema.find({ status: "waiting_for_review" }).count()
        let reviewed = await DocumentSchema.find({ status: "Reviewed" }).count()
        let wfa = await DocumentSchema.find({ status: "waiting_for_approval" }).count()
        let approved = await DocumentSchema.find({ status: "approved" }).count()

        resObject.push({ status: "Created", count: created })
        resObject.push({ status: "Waiting for review", count: wfr })
        resObject.push({ status: "Reviewed", count: reviewed })
        resObject.push({ status: "Waiting for approval", count: wfa })
        resObject.push({ status: "Approved", count: approved })
        resObject.push({ status: "Published", count: published })


        res.status(200).json(resObject)

    } catch (error) {
        res.status(404).json(error)
    }
})

app.get("/published-doc", async (req, res) => {
    try {
        let pageNumber = Math.abs(parseInt(req.query.page)) || 1; //initially on first page
        let limit = Math.abs(parseInt(req.query.limit)) || 10; //by default give 10 data per page

        let resObject = {
            result: [],
            pageNumber: pageNumber,
            resultCount: 0,
            totalCount: 0
        }
        const data = await DocumentSchema.find({ status: "Published" }).skip((pageNumber - 1) * limit).limit(limit)
        const totalData = await DocumentSchema.find({ status: "Published" }).count()
        resObject.result = data
        resObject.resultCount = data.length;
        resObject.totalCount = totalData
        res.status(200).json(resObject)


    } catch (error) {
        console.log(error)
        res.status(404).json(error.message)
    }
})



app.post("/read-doc", authenticateToken, upload.single('file'), async (req, res) => {
    try {
        var html;
        var filename;
        console.log('File uploaded:', req.file);
        console.log(req.user)
        // res.json({ message: 'File uploaded successfully' });
        let path = req.file.filename
        await mammoth.convertToHtml({ path: `./uploadedFiles/${path}` })
            .then(function (result) {
                html = result.value; // The generated HTML
                console.log(html)
                fs.writeFileSync(`./Data/${req.body.name}.html`, html);
                filename = `./Data/${req.body.name}.html`
                var messages = result.messages; // Any messages, such as warnings during conversion
            })
            .catch(function (error) {
                console.error(error);
            });
        let newVersion = {
            draft: 1,
            final: 1,
        }
        const new_doc = new DocumentSchema({
            // id: req.body.data.id,
            name: req.body.name, //req.file.originalname,
            file: filename,
            status: 'created',//req.body.status,
            department: req.body.department,
            doc_number: req.body.doc_number,
            comments: req.body.comments,
            category: req.body.category,
            created_by: req.body.id,
            modified_by: req.body.id,
            created_date: new Date(),
            modified_date: new Date(),
            version: req.body.version,
            // comments: req.body.data.comments,
            // reviewer: req.body.data.reviewer,
            // approver: req.body.data.approver,
            // reviewer_date: req.body.data.reviewer_date,
            // approver_date: req.body.data.approver_date,
        })
        const docCreated = await new_doc.save()
        // console.log("docCreated", docCreated)
        if (!docCreated) {
            return res.sendStatus(204)
        } else {
            await sendEmail(req.user.email, `${docCreated.name} has been Created by ${docCreated.modified_by}`, "Document Created");
            const new_log = new NewLogSchema({
                version: 1,
                doc_name: docCreated.name,
                doc_id: docCreated.id,
                event: "Document Created",
                prev_status: docCreated.status,
                curr_status: docCreated.status,
                created_by: docCreated.created_by,
                executed_by: req.body.id,
                reviewed_by: '',
                created_date: new Date(),
                modified_date: new Date(),
            })
            const logCreated = await new_log.save();
            // const logCreated = await new_log.save();
            console.log(req.file.originalname)
            fs.unlinkSync(`./uploadedFiles/${req.file.originalname}`)
            return res.status(200).json(docCreated)
        }


    } catch (error) {
        console.log(error)
    }
})



//---------------------------------------------Module & Log----------------//
//Get all Module
app.get("/allmodule", async (req, res, next) => {
    try {
        const getModule = await Log_Schema.find().sort({ createdAt: -1 })
        if (getModule.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getModule)
        }
    } catch (err) {
        next(err)
    }

})
//---------------------------------------------Equipment----------------//

//Get all Equipment
app.get("/equipment", async (req, res, next) => {
    try {
        const getEquipment = await Equipment_Schema.find().sort({ createdAt: -1 })
        if (getEquipment.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getEquipment)
        }
    } catch (err) {
        next(err)
    }

})

//Get single Equipment
app.get("/equipment/:id", async (req, res, next) => {
    try {
        const getEquipment = await Equipment_Schema.findOne({ _id: req.params.id })
        if (!getEquipment) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getEquipment)
        }
    } catch (err) {
        next(err)
    }

})


//---------------------------------------------Room----------------//

//Get all Room
app.get("/room", async (req, res, next) => {
    try {
        const getRoom = await Room_Schema.find().sort({ createdAt: -1 })
        if (getRoom.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})

//Get single Room
app.get("/room/:id", async (req, res, next) => {
    try {
        const getRoom = await Room_Schema.findOne({ _id: req.params.id })
        if (!getRoom) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})

//---------------------------------------------Room Trans----------------//

//Get all Room Trans
app.get("/roomtrans", async (req, res, next) => {
    try {
        const getRoom = await Room_Trans_Schema.find().sort({ createdAt: -1 })
        if (getRoom.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})

//Get single Room Trans
app.get("/roomtrans/:id", async (req, res, next) => {
    try {
        const getRoom = await Room_Trans_Schema.findOne({ _id: req.params.id })
        if (!getRoom) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})

//Create Single room trans 

app.post("/createroom", async (req, res, next) => {
    try {

        const new_room = new Room_Trans_Schema({
            companyName: "Zydus Lifesciences Limited",
            site: "Moriya",
            department: "Tablet Facility",
            annexureNo: "102489975",
            annexureTitle: "Equipment Sequential Log",
            versionNo: "V1.0",
            module: "Production 01",
            id: req.body.id,
            type: req.body.type,
            name: req.body.name,
            status: req.body.status,
            reviewBy: req.body.reviewBy,
            reviewDate: req.body.reviewDate,
            approveBy: req.body.approveBy,
            approveDate: req.body.approveDate,
            activity_type: req.body.activity_type,
            batch_number: req.body.batch_number,
            product_code: req.body.product_code,
            product_name: req.body.product_name,
            lot_number: req.body.lot_number,
            cleaning_type: req.body.cleaning_type,
            stage: req.body.stage,
            remarks: req.body.remarks,
            created_by: req.body.created_by,
            modified_by: req.body.modified_by,
            activities: req.body.activities,
        })

        const newRoom = await new_room.save()
        if (newRoom.length === 0) {
            return res.sendStatus(204)
        } else {
            const new_logger = new Logger_Schema({
                module_name: "Activity Sequential Log for Equipment",
                event_name: "Room Activity Started",
                executed_date: new Date(),
                executed_by: req.body.created_by,
                remarks: newRoom.name,
                event_data: newRoom
            })
            const newLogger = await new_logger.save()
            res.status(200).json(newRoom)
        }
    } catch (err) {
        next(err)
    }
})

//Update Single room trans 
app.patch("/updateroom/:id", signFolder.array("signature"), async (req, res, next) => {
    try {

        if (req.body.signature) {
            var image = ""
            if (req.body.signature === "" || req.body.signature === null) {
                image = ""
            } else if ((req.body.signature).includes("https://zvrepo.s3.ap-south-1.amazonaws.com")) {
                image = req.body.signature
            } else {
                const file = req.body.signature.split(',')[1]
                const ext = req.body.signature.split(';')[0].split('/')[1]
                const buffer = Buffer.from(file, "base64");
                const UploadLogo = await signatureUpload(buffer, ext);
                image = UploadLogo.Location
            }
        }

        const roomDetail = await Room_Trans_Schema.findOne({ _id: req.params.id })


        const new_room = {
            companyName: "Zydus Lifesciences Limited",
            site: "Moriya",
            department: "Tablet Facility",
            annexureNo: "102489975",
            annexureTitle: "Equipment Sequential Log",
            versionNo: "V1.0",
            module: "Production 01",
            id: req.body.id,
            type: req.body.type,
            name: req.body.name,
            status: req.body.status,
            reviewBy: req.body.reviewBy,
            reviewDate: req.body.reviewDate,
            approveBy: req.body.approveBy,
            approveDate: req.body.approveDate,
            activity_type: req.body.activityType,
            batch_number: req.body.batch_number,
            product_code: req.body.product_code,
            product_name: req.body.product_name,
            lot_number: req.body.lot_number,
            cleaning_type: req.body.cleaning_type,
            stage: req.body.stage,
            signature: image,
            remarks: req.body.remarks,
            created_by: req.body.created_by,
            modified_by: req.body.modified_by,
            activities: req.body.activities,
        }

        const newRoom = await Room_Trans_Schema.findByIdAndUpdate({ _id: req.params.id }, new_room)
        if (!newRoom) {
            return res.sendStatus(204)
        } else {
            const new_logger = new Logger_Schema({
                module_name: "Activity Sequential Log for Equipment",
                event_name: "Room Activity Performed",
                executed_date: new Date(),
                executed_by: req.body.created_by,
                remarks: roomDetail.name,
                event_data: roomDetail
            })
            const newLogger = await new_logger.save()

            res.status(200).json(newRoom)
        }
    } catch (err) {
        next(err)
    }
})

//Get single Room Trans
app.get("/customreport/:id", async (req, res, next) => {
    try {
        const getRoom = await Room_Trans_Schema.findOne({ _id: req.params.id })
        if (!getRoom) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})

//------------------------------------------Logger-----------------------------------
//Get all logger

app.get("/logger", async (req, res, next) => {
    try {
        const getLogger = await Logger_Schema.find().sort({ createdAt: -1 })
        if (getLogger.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(getLogger)
        }
    } catch (err) {
        next(err)
    }

})

//Get report history activity
app.get("/history/:id", async (req, res, next) => {
    try {
        const getRoom = await Room_Trans_Schema.findOne({ _id: req.params.id })
        if (!getRoom) {
            return res.sendStatus(204)
        } else {
            if (getRoom.type === "Fixed Equipment") {
                for (let i = 0; i < getRoom.activities.length; i++) {
                    let data = {
                        id: getRoom.id,
                        name: getRoom.name,
                        batch_number: getRoom.batch_number,
                    }
                }
            }
            res.status(200).json(getRoom)
        }
    } catch (err) {
        next(err)
    }

})


app.get("/prev", async (req, res, next) => {
    try {
        let room = req.query.name
        let batch = req.query.batch

        const getRoom = await Room_Trans_Schema.findOne({ name: room, batch_number: batch }).sort({ createdAt: -1 })
        res.status(200).send(getRoom)

    } catch (err) {
        next(err)
    }

})



////////////////////////////////////////////////////////////////
//************************************************************//
////////////////////////////////////////////////////////////////
//DOCS
app.post("/document", authenticateToken, async (req, res, next) => {
    try {

        console.log(req)
        const { file, name } = req.body.data;
        let newVersion = {
            draft: 1,
            final: 1,
        }
        console.log(file, name)



        fs.writeFileSync(`./Data/${name}.html`, file);
        const filename = `./Data/${name}.html`
        const new_doc = new DocumentSchema({
            // id: req.body.data.id,
            name: req.body.data.name, //req.file.originalname,
            file: filename,//req.body.data.file,
            status: 'created',//req.body.status,
            comments: req.body.data.comments,
            category: req.body.data.category,
            department: req.body.data.department,
            doc_number: req.body.data.doc_number,
            created_by: req.body.user.id,
            modified_by: req.body.user.id,
            created_date: new Date(),
            modified_date: new Date(),
            version: req.body.data.version,
            // comments: req.body.data.comments,
            // reviewer: req.body.data.reviewer,
            // approver: req.body.data.approver,
            // reviewer_date: req.body.data.reviewer_date,
            // approver_date: req.body.data.approver_date,
        })
        const docCreated = await new_doc.save()
        // console.log("docCreated", docCreated)
        if (!docCreated) {
            return res.sendStatus(204)
        } else {
            await sendEmail(req.user.email, `A new document named ${docCreated.name} has been Created by ${docCreated.modified_by}`, "Document Created");
            const new_log = new NewLogSchema({
                version: 1,
                doc_name: docCreated.name,
                doc_id: docCreated.id,
                event: "Document Created",
                prev_status: docCreated.status,
                curr_status: docCreated.status,
                created_by: docCreated.created_by,
                executed_by: req.body.user.id,
                reviewed_by: '',
                created_date: new Date(),
                modified_date: new Date(),
            })
            const logCreated = await new_log.save();
            // const logCreated = await new_log.save();
            return res.status(200).json(docCreated)
        }
    } catch (err) {
        next(err)
    }
});
app.get("/document/:id", async (req, res, next) => {
    try {
        const doc = await DocumentSchema.findOne({ _id: req.params.id })
        if (!doc) {
            return res.sendStatus(204)
        } else {
            // if (getRoom.type === "Fixed Equipment") {
            //     for (let i = 0; i < getRoom.activities.length; i++) {
            //         let data = {
            //             id: getRoom.id,
            //             name: getRoom.name,
            //             batch_number: getRoom.batch_number,
            //         }
            //     }
            // }
            const fileContent = fs.readFileSync(doc.file, 'utf-8')

            // console.log(doc)
            res.status(200).json({ doc, fileContent });
        }
    } catch (err) {
        next(err)
    }

});
app.get("/document-all", authenticateToken, async (req, res, next) => {
    try {

        let role = req.query.role;
        let status = req.query.status

        if (role == "1000") {
            if (status == "all") {
                var allDocs = await DocumentSchema.find({ approver: req.user.email, $or: [{ status: { $in: ["approved", "waiting_for_approval"] } }] }).sort({ created_date: -1 })
            } else {
                var allDocs = await DocumentSchema.find({ approver: req.user.email, status: status }).sort({ created_date: -1 })

            }
        }
        if (role == "1001") {
            if (status == "all") {
                var allDocs = await DocumentSchema.find({ reviewer: req.user.email, $or: [{ status: { $in: ["Reviewed", "waiting_for_review", "reviewed_with_comment"] } }] }).sort({ created_date: -1 })
            } else {
                var allDocs = await DocumentSchema.find({ reviewer: req.user.email, status: status }).sort({ created_date: -1 })
            }

        }
        if (role == "1003") {
            if (status == "all") {
                var allDocs = await DocumentSchema.find({ status: { $nin: ["Published",] } }).sort({ created_date: -1 })

            } else {

                var allDocs = await DocumentSchema.find({ status: status }).sort({ created_date: -1 })
            }
        }
        if (allDocs.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(allDocs)
        }
    } catch (err) {
        next(err)
    }

});
app.patch("/document/:id", authenticateToken, async (req, res, next) => {
    try {
        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        const reqStatus = req.body.data.status;
        existingDoc = await DocumentSchema.findOne({ _id: req.params.id });
        let newVersion = {
            draft: Math.floor(existingDoc.version.draft + 0.1),
            final: existingDoc.version.final,
        }
        if (reqStatus === 'approved') {
            newVersion = {
                draft: existingDoc.version.draft,
                final: Math.floor(existingDoc.version.final + 0.1),
            }
        }
        // else if (reqStatus === 're_drafted') { }
        // else if (reqStatus === 'waiting_for_approval') { }
        // else if (reqStatus === 'waiting_for_review') { }
        // else if (reqStatus === 'reviewed') { }
        // else { // created
        // }
        const doc = {
            ...(req.body.data.name) && { name: req.body.data.name },
            ...(req.body.data.file) && { file: req.body.data.file },
            ...(req.body.data.status) && { status: req.body.data.status },
            ...(req.body.data.comments) && { comments: req.body.data.comments },
            ...(req.body.data.category) && { category: req.body.data.category },
            // name: req.body.data.name, //req.file.originalname,
            // file: req.body.data.file,//req.file.path,
            // status: req.body.data.status,
            // comments: req.body.data.comments,
            // category: req.body.data.category,
            ...(reqStatus === 'created') && { created_by: req.body.user.id },
            modified_by: req.body.user.id,
            ...(reqStatus === 'created') && { created_date: new Date() },
            modified_date: new Date(),
            // version: newVersion,
            // comments: req.body.data.comments,
            ...(req.body.data.reviewer) && { reviewer: req.body.data.reviewer },
            ...(req.body.data.approver) && { approver: req.body.data.approver },
            ...(req.body.data.reviewer) && { reviewer_date: new Date() },
            ...(reqStatus === 'approved') && { approver_date: new Date() },
        };
        const updatedDoc = await DocumentSchema.findByIdAndUpdate({ _id: req.params.id }, doc);
        // console.log("updatedDoc", updatedDoc)
        if (!updatedDoc) {
            return res.sendStatus(204)
        } else {
            let message = returnMessage(reqStatus);

            await sendEmail(req.user.email, `${updatedDoc.name} has been Updated by ${updatedDoc.modified_by} ${message}`, reqStatus === 'approved' ? "Master Copy Created" : "Document Updated");

            // if (req.body.data.status == "waiting_for_review") {

            //     await sendEmail(req.body.data.reviewer, `${updatedDoc.name} has been Updated by ${updatedDoc.modified_by} ${message}`, reqStatus === 'approved' ? "Master Copy Created" : "Document Updated");
            // }
            const new_log = new NewLogSchema({
                version: reqStatus === 'approved' ? updatedDoc.version.final : updatedDoc.version.draft,
                doc_name: updatedDoc.name,
                doc_id: updatedDoc.id,
                event: returnEvent(reqStatus),
                prev_status: existingDoc.status,
                curr_status: updatedDoc.status,
                created_by: updatedDoc.created_by,
                reviewed_by: updatedDoc.reviewer,
                executed_by: req.body.user.id,
                created_date: new Date(),
                modified_date: new Date(),
            })
            const logCreated = await new_log.save();
            return res.status(200).json(updatedDoc)
        }
        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
    } catch (err) {
        next(err)
    }
});

const returnMessage = (status) => {
    if (status === 'waiting_for_review')
        return 'and is ready for Review.';
    else if (status === 'waiting_for_approval')
        return 'and is ready for Approval.';
    else return '';
}
const returnEvent = (status) => {
    if (status === 'waiting_for_review')
        return 'Waiting for Review';
    else if (status === 'Reviewed')
        return 'Document Reviewed';
    else if (status === 'Waiting for Approval')
        return 'Waiting for Approval';
    else if (status === 'approved')
        return 'Document Approved';
    else if (status === 'created')
        return 'Document Created';
    else if (status === 'Published')
        return 'Document Published';
    else return '';
}
//LOGS
// app.post("/log/", async (req, res, next) => {
//     try {
//     } catch (err) {
//         next(err)
//     }

// });
app.get("/log/:id", async (req, res, next) => {
    try {
        const docLogs = await NewLogSchema.find({ doc_id: req.params.id }).sort({ created_date: -1 })
        if (docLogs.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(docLogs)
        }
    } catch (err) {
        next(err)
    }
});
app.get("/log-all", async (req, res, next) => {
    try {
        const allLogs = await NewLogSchema.find({}).sort({ created_date: -1 })
        if (allLogs.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(allLogs)
        }
    } catch (err) {
        next(err)
    }
});
// const createLog = (data, event) => {
//     const new_log = new LogSchema({
//         version: data[0].version,
//         doc_name: data[0].name,
//         doc_id: data[0].id,
//         event: event,//"Document Created",
//         prev_status: data[0].status,
//         curr_status: data[0].status,
//         created_by: data[0].created_by,
//         reviewed_by: data[0].reviewed_by,
//         created_date: new Date(),
//         modified_date: new Date(),
//     })
//     const logCreated = new_log.save();
//     return;
// }
const sendEmail = async (reciepient, text, title) => {
    try {
        const transport = createTransport({
            host: process.env.MAIL_HOST,
            port: process.env.MAIL_PORT,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })
        let mailOptions = {
            from: process.env.MAIL_USER,
            to: reciepient,
            subject: title,
            html: emailTemplate.replace(
                "**********MESSAGE**********",
                text
            ),
        };
        await transport.sendMail(mailOptions)
    }
    catch (err) {
        // next(err)
        console.log("sendEmail error", err)
    }
}
const uploadFile = () => {
    try {

    } catch (error) {
        console.log("uploadFile error", error)
    }
}

//COMMENTS
app.post("/comment/:id", async (req, res, next) => {
    try {
        // let existingDoc = await DocumentSchema.findOne({ _id: req.params.id });
        // const new_comments = new DocumentSchema({
        //     id: req.params.id,
        //     // comments: existingDoc.comments.push(req.body.data.comments),
        //     comments: req.body.data.comments,
        //     modified_by: req.body.user.id,
        //     modified_date: new Date(),
        // })
        // const commentCreated = await DocumentSchema.findByIdAndUpdate({ _id: req.params.id }, new_comments);
        // // console.log("commentCreated", commentCreated)
        // if (!commentCreated) {
        //     return res.sendStatus(204)
        // } else {
        //     const new_log = new NewLogSchema({
        //         version: commentCreated.version.draft,
        //         doc_name: commentCreated.name,
        //         doc_id: commentCreated.id,
        //         event: "New Comment Added",
        //         prev_status: commentCreated.status,
        //         curr_status: commentCreated.status,
        //         created_by: commentCreated.created_by,
        //         // reviewed_by: existingDoc.,
        //         created_date: new Date(),
        //         modified_date: new Date(),
        //     });
        //     const logCreated = await new_log.save();
        //     // const logCreated = await new_log.save();
        //     return res.status(200).json(commentCreated);
        // }

        return DocumentSchema.updateOne(
            { _id: req.params.id },  // <-- find stage
            {
                $set: {                // <-- set stage
                    // id: req.params.id,     // <-- id not _id
                    comments: req.body.data.comments,
                    modified_by: req.body.user.id,
                    modified_date: new Date(),
                }
            }
        ).then(async (result) => {
            // console.log("result", result)
            let commentCreated = await DocumentSchema.findOne({ _id: req.params.id });
            const new_log = new NewLogSchema({
                version: commentCreated.version.draft,
                doc_name: commentCreated.name,
                doc_id: commentCreated.id,
                event: "New Comment Added",
                prev_status: commentCreated.status,
                curr_status: commentCreated.status,
                created_by: commentCreated.created_by,
                executed_by: req.body.user.id,
                // reviewed_by: existingDoc.,
                created_date: new Date(),
                modified_date: new Date(),
            });
            const logCreated = await new_log.save();
            // const logCreated = await new_log.save();
            // return res.status(200).json(commentCreated);
            return res.status(200).json({ message: "Commented successfully!" });
        })
        // .catch((err) => res.sendStatus(204).json({ message: `Request Failed!${err}` }));


    } catch (err) {
        next(err)
    }
});
////////////////////////////////////////////////////////////////
//************************************************************//
////////////////////////////////////////////////////////////////



process.on("warning", (e) => console.warn(e.stack)); //To print the warning messages
app.use(errorHandler); //Error handler middleware

// Application running in this portal
app.listen(port, () => console.log(`Server running on port ${port}`));
