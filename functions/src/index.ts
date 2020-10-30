const functions = require('firebase-functions');
const emailjs = require('emailjs/email');
const pdfdocument = require('pdfkit');

exports.sendmailfn = functions.database.ref('/sendmail/{emailkey}').onWrite(() => {
    var doc = new pdfdocument();

    doc.text('This email was sent as soon as the user logged in');
    doc.end();

    var server = emailjs.server.connect({
        user: "rinoweb.fr@gmail.com",
        password:"Rinoweb&Co4!20",
        host: 'smtp.gmail.com',
        ssl: true
    });
    
    server.send({
        text: 'This mail was sent automatically when the user logged in',
        from: 'rinoweb.fr@gmail.com',
        to: "rinoweb.fr@gmail.com",
        subject: 'Wow, we can send an email this way',
        attachment: [
            {data: 'somerandomdata', type:'application/pdf', stream: doc, name: 'rules.pdf'}
        ]
    }, (err: any, message: any) => {
        if (err) 
            console.log(err)    
    })

})