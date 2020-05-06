const cors = require("cors")
const express = require("express") //npm install -g json2csv
import * as functions from 'firebase-functions';
export const admin = require('firebase-admin');
 
var serviceAccount = require("../keys/admin.json");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://etoken-ecd58.firebaseio.com"
  });



  const app = express();
  app.use(cors({ origin: true }));

  app.get("/getShopDetails", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      console.error(req.query.shop);
      const shopName:string = req.query.shopName;
      const shopSecret:string = req.query.shopSecret;
      const docName= shopName+shopSecret;

      console.error(docName);
      const db = admin.firestore();
      const shopData = db.collection("shop").doc(docName);
      // let shopQuery=  shopData.where('name', '==', shopName);
                    //.where('secret', '==', shopSecret);
        let shopSnap=   await  shopData.get();
        if (!shopSnap.exists) {
            res.status(403).send({
                    "error":"Check the Shop details"
                });
                return;
        }
        const currentToken:Number= shopSnap.data().currentToken;
        const message= shopSnap.data().message;
        const name= shopSnap.data().shopName;
        const timeToken:Number= shopSnap.data().timeToken;
        const totalToken :Number= shopSnap.data().totalToken
        res.status(200).send({
            "currentToken":currentToken, 
            "message":message,
            "name":name,
            "timeToken":timeToken,
            "totalToken":totalToken
           });

    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });

  app.get("/getCustomerShopDetails", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      console.error(req.query.shop);
      const shopName:string = req.query.shopName;
      const db = admin.firestore();
      let shopData = db.collection("shop");
      shopData.where('name', '==', shopName).limit(1);
                   
      let shopSnapCheck=   await  shopData .get();
      let messageString:string="";
      let shopNameDisplay:String="";
        if(shopSnapCheck._size>0) {
          shopSnapCheck.forEach(function(doc:any) {   
             messageString= doc.data().message;
            shopNameDisplay=doc.data().shopName;
          });   
      

        }else{
          res.status(403).send({
            "error":"Check the Shop details"
        });
        return;
        }
        res.status(200).send({
            "shopNameDisplay":shopNameDisplay, 
            "messageString":messageString     
           });

    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });

  app.use(express.json())
  app.post("/updateShopDetails", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      const shopName:string = req.body.shopName;
      const shopSecret:string = req.body.shopSecret;
      const message:string = req.body.message;
      const timeToken:Number = req.body.timeToken;
      const docName= shopName+shopSecret;

      console.error(docName);
      const db = admin.firestore();
      let shopData = db.collection("shop").doc(docName);
      // let shopQuery=  shopData.where('name', '==', shopName);
                    //.where('secret', '==', shopSecret);
        let shopSnapCheck=   await  shopData.get();
        if (!shopSnapCheck.exists) {
            res.status(403).send({
                    "error":"Check the Shop details"
                });
                return;
        }
        
        await shopData.update({
            message: message,timeToken:timeToken
            });
        let shopSnap=   await  shopData.get();
        let currentToken:Number= shopSnap.data().currentToken;
        let messageString= shopSnap.data().message;
        let name= shopSnap.data().name;
        let timeTokenValue:Number= shopSnap.data().timeToken;
        let totalToken :Number= shopSnap.data().totalToken
        res.status(200).send({
            "currentToken":currentToken, 
            "message":messageString,
            "name":name,
            "timeToken":timeTokenValue,
            "totalToken":totalToken
           });

    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });



  app.post("/increaseToken", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      console.error(req.query.shop);
      const shopName:string = req.body.shopName;
      const shopSecret:string = req.body.shopSecret;
      const increaseNo:number = req.body.increaseNo;

      if(isNaN(increaseNo)){
        res.status(403).send({
            "error":"Wrong Increase"
        });
        return;
      }
      const docName= shopName+shopSecret;
      console.error(docName);
      const db = admin.firestore();
      let shopData = db.collection("shop").doc(docName);
      // let shopQuery=  shopData.where('name', '==', shopName);
                    //.where('secret', '==', shopSecret);
        let shopSnapCheck=   await  shopData.get();
        if (!shopSnapCheck.exists) {
            res.status(403).send({
                    "error":"Check the Shop details"
                });
                return;
        }
        let currentToken:number= shopSnapCheck.data().currentToken; 
        currentToken=currentToken+ increaseNo;
        await shopData.update({
            currentToken: currentToken
            });
        let shopSnap=   await  shopData.get();

        let currentTokenValue:number= shopSnap.data().currentToken;
        let messageString= shopSnap.data().message;
        let name= shopSnap.data().name;
        let timeTokenValue:Number= shopSnap.data().timeToken;
        let totalToken :Number= shopSnap.data().totalToken
        res.status(200).send({
            "currentToken":currentTokenValue, 
            "message":messageString,
            "name":name,
            "timeToken":timeTokenValue,
            "totalToken":totalToken
           });

    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });


  app.post("/generateToken", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      console.error(req.query.shop);
      const shopName:string = req.body.shopName;
      const mobileNo:string = req.body.mobileNo;

      const db = admin.firestore();
      let shopData = db.collection("shop");
      shopData.where('name', '==', shopName).limit(1);
                   
      let shopSnapCheck=   await  shopData .get();
      let shopSecret:String="";
      let totalToken:number=0;
      let generatedTokens:any=null;
      let messageString:string="";
      let name:string="";
      let currentTokenValue:number=0;
      let timeTokenValue:number=0;
      let tokenNo :number= 0;
      let eta : number=0;
      let shopNameDisplay:String="";
        if(shopSnapCheck._size>0) {
          shopSnapCheck.forEach(function(doc:any) {
            shopSecret= doc.data().secret;
            totalToken= doc.data().totalToken; 
             messageString= doc.data().message;
             name= doc.data().name;
             currentTokenValue= doc.data().currentToken;
            timeTokenValue= doc.data().timeToken;
            generatedTokens= doc.data().generatedTokens;
            shopNameDisplay=doc.data().shopName;
          });   
      

        }else{
          res.status(403).send({
            "error":"Check the Shop details"
        });
        return;
        }
        let tokenFound:boolean =false;
        console.error(generatedTokens);
        if(generatedTokens!=null){
          generatedTokens.forEach(function(generateToken:any) {
              if(generateToken.mobileNo==mobileNo){
                tokenNo=generateToken.tokenNo;
                tokenFound=true;
                if(tokenNo>currentTokenValue)
                    eta= (tokenNo-currentTokenValue)*timeTokenValue;  
                 console.error("token foubd"+tokenNo);
    
                
              }
            });
         
        }
        if(tokenFound){
          res.status(200).send({
            "currentToken":currentTokenValue, 
            "message":messageString,
            "name":name,
            "eta":eta,
            "tokenNo":tokenNo,
            "shopNameDisplay":shopNameDisplay
           });
          return;
        }
        const docName= shopName+shopSecret;
        console.error(docName);

        let shopUpdate = db.collection("shop").doc(docName);
        totalToken=totalToken+ 1;
        tokenNo=totalToken;
        await shopUpdate.update({
          totalToken: totalToken,
          generatedTokens:  admin.firestore.FieldValue.arrayUnion(
            {
               "mobileNo": mobileNo,"createdOn" :new Date().toISOString(),tokenNo:totalToken
            } )
            });
        if(tokenNo>currentTokenValue)
          eta= (tokenNo-currentTokenValue)*timeTokenValue;
        //let totalToken :Number= shopSnap.data().totalToken
        res.status(200).send({
            "currentToken":currentTokenValue, 
            "message":messageString,
            "name":name,
            "eta":eta,
            "tokenNo":tokenNo,
            "shopNameDisplay":shopNameDisplay
           });

    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });


  app.post("/resetToken", async (req:any, res:any) => {
    try{
      //console.log(req.user);
     
      console.error(req.query.shop);
      const shopName:string = req.body.shopName;
      const shopSecret:string = req.body.shopSecret;

      const docName= shopName+shopSecret;
      console.error(docName);
      const db = admin.firestore();
      let shopData = db.collection("shop").doc(docName);
      // let shopQuery=  shopData.where('name', '==', shopName);
                    //.where('secret', '==', shopSecret);
        let shopSnapCheck=   await  shopData.get();
        if (!shopSnapCheck.exists) {
          res.status(403).send({
                  "error":"Check the Shop details"
              });
              return;
      }
      let totalToken:number=shopSnapCheck.data().totalToken;
      let generatedTokens:any=shopSnapCheck.data().generatedTokens;
     


        let shopUpdate = db.collection("shop").doc(docName);
  
        await shopUpdate.update({
          totalToken: 0,currentToken:0,generatedTokens:[],
          historyTokens:  admin.firestore.FieldValue.arrayUnion(
            {
               "totalToken": totalToken,"createdOn" :new Date().toISOString(),generatedTokens:generatedTokens
            } )
            });
      
            let shopSnap=   await  shopData.get();

            let currentTokenValue:number= shopSnap.data().currentToken;
            let messageString= shopSnap.data().message;
            let name= shopSnap.data().name;
            let timeTokenValue:Number= shopSnap.data().timeToken;
            let totalTokenValue :Number= shopSnap.data().totalToken
            res.status(200).send({
                "currentToken":currentTokenValue, 
                "message":messageString,
                "name":name,
                "timeToken":timeTokenValue,
                "totalToken":totalTokenValue
               });
    }catch(error){
      console.log(error);
      res.status(500).send(error);
      return;
    }
  });

  const api = functions.region('asia-east2').https.onRequest(app);
   
  module.exports = {
    api
  }
