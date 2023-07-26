/* importing package & local dependencies */
require("dotenv").config();
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

//#Local files

const Log_Schema = require("./models/Log_Schema")
const Logger_Schema = require("./models/Logger_Schema")
const Room_Schema = require("./models/Room_Schema")
const Room_Trans_Schema = require("./models/Room_Trans_Schema")
const Equipment_Schema = require("./models/Equipment_Schema")
const { signatureUpload } = require("./uploads/signUpload");
const { signFolder } = require("./utils/signStorage");

//////////////////////////////////////////////////
//////////////////////////////////////////////////
const DocumentSchema = require("./models/Document")
const NewLogSchema = require("./models/log")
// const Equipment_Schema = require("./models/Equipment_Schema")
//////////////////////////////////////////////////
//////////////////////////////////////////////////

//middleware for JSON
// app.use(express.json({limit: '50mb'}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json());
//middleware for CORS
app.use(credentials);
app.use(cors(corsOptions));
app.use(cookieParser()); //middleware for cookies

/* importing local Routes */
const login = require("./routes/Login");
const logout = require("./routes/logout");
const user = require("./routes/Register");

/* importing local Routes base URL points */
app.use("/register", user);
app.use("/login", login);
app.use("/logout", logout);


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
app.post("/document", async (req, res, next) => {
    try {
        let newVersion = {
            draft: 1,
            final: 1,
        }
        const new_doc = new DocumentSchema({
            // id: req.body.data.id,
            name: req.body.data.name,
            file: req.body.data.file,
            status: 'created',//req.body.status,
            comments: req.body.data.comments,
            category: req.body.data.category,
            created_by: req.body.user.id,
            modified_by: req.body.user.id,
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
            const new_log = new NewLogSchema({
                version: 1,
                doc_name: docCreated.name,
                doc_id: docCreated.id,
                event: "Document Created",
                prev_status: docCreated.status,
                curr_status: docCreated.status,
                created_by: docCreated.created_by,
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
            res.status(200).json(doc);
        }
    } catch (err) {
        next(err)
    }

});
app.get("/document-all", async (req, res, next) => {
    try {
        const allDocs = await DocumentSchema.find({}).sort({ created_date: -1 })
        if (allDocs.length === 0) {
            return res.sendStatus(204)
        } else {
            res.status(200).json(allDocs)
        }
    } catch (err) {
        next(err)
    }

});
app.patch("/document/:id", async (req, res, next) => {
    try {

        ///////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////
        const reqStatus = req.body.status;
        existingDoc = await DocumentSchema.findOne({ _id: req.params.id });
        let newVersion = {
            draft: existingDoc.version.draft + 0.1,
            final: existingDoc.version.final,
        }
        if (reqStatus === 'approved') {
            newVersion = {
                draft: existingDoc.version.draft,
                final: existingDoc.version.final + 0.1,
            }
        }
        // else if (reqStatus === 're_drafted') { }
        // else if (reqStatus === 'waiting_for_approval') { }
        // else if (reqStatus === 'waiting_for_review') { }
        // else if (reqStatus === 'reviewed') { }
        // else { // created

        // }
        const doc = new DocumentSchema({
            name: req.body.data.name,
            file: req.body.data.file,
            status: req.body.data.status,
            comments: req.body.data.comments,
            category: req.body.data.category,
            created_by: req.body.user.id,
            modified_by: req.body.user.id,
            created_date: new Date(),
            modified_date: new Date(),
            version: newVersion,
            // comments: req.body.data.comments,
            // reviewer: req.body.data.reviewer,
            // approver: req.body.data.approver,
            // reviewer_date: req.body.data.reviewer_date,
            // approver_date: req.body.data.approver_date,
        });
        const updatedDoc = await DocumentSchema.findByIdAndUpdate({ _id: req.params.id }, doc);
        // console.log("updatedDoc", updatedDoc)
        if (!updatedDoc) {
            return res.sendStatus(204)
        } else {
            const new_log = new NewLogSchema({
                version: reqStatus === 'approved' ? updatedDoc.version.final : updatedDoc.version.draft,
                doc_name: updatedDoc.name,
                doc_id: updatedDoc.id,
                event: reqStatus === 'approved' ? "Master Copy Created" : "Document Updated",
                prev_status: existingDoc.status,
                curr_status: updatedDoc.status,
                created_by: updatedDoc.created_by,
                reviewed_by: updatedDoc.reviewer,
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

//LOGS
app.post("/log/", async (req, res, next) => {
    try {
    } catch (err) {
        next(err)
    }

});
app.get("/log-all", async (req, res, next) => {
    try {
        const allLogs = await NewLogSchema.find().sort({ created_date: -1 })
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
const sendEmail = (sender, reciepient, messageTemplate, title) => {

}

//COMMENTS
app.post("/comment/", async (req, res, next) => {
    try {
        // const new_comment = new DocumentSchema({
        //     // id: req.body.data.id,
        //     name: req.body.data.name,
        //     file: req.body.data.file,
        //     status: 'created',//req.body.status,
        //     comments: req.body.data.comments.push(),
        //     category: req.body.data.category,
        //     created_by: req.body.user.id,
        //     modified_by: req.body.user.id,
        //     created_date: new Date(),
        //     modified_date: new Date(),
        //     version: newVersion,
        //     // comments: req.body.data.comments,
        //     // reviewer: req.body.data.reviewer,
        //     // approver: req.body.data.approver,
        //     // reviewer_date: req.body.data.reviewer_date,
        //     // approver_date: req.body.data.approver_date,
        // })
        // const commentCreated = await new_comment.save()
        // // console.log("commentCreated", commentCreated)
        // if (!commentCreated) {
        //     return res.sendStatus(204)
        // } else {
        //     const new_log = new NewLogSchema({
        //         version: 1,
        //         doc_name: docCreated.name,
        //         doc_id: docCreated.id,
        //         event: "New Comment Added",
        //         prev_status: docCreated.status,
        //         curr_status: docCreated.status,
        //         created_by: docCreated.created_by,
        //         reviewed_by: '',
        //         created_date: new Date(),
        //         modified_date: new Date(),
        //     })
        //     const logCreated = await new_log.save();
        //     // const logCreated = await new_log.save();
        //     return res.status(200).json(commentCreated);
        // } 
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
