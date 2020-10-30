<?php
   // data sent in header are in JSON format
   header('Content-Type: application/json');
   // takes the value from variables and Post the data
   $email = "contact@rinoweb.fr";
   $to = "marino.theo@gmail.com";
   $subject = "Contact Us";
   // Email Template
   $message .= "<b>Message : </br><br>";

   $header = "From:"+$email+" \r\n";
   $header .= "MIME-Version: 1.0\r\n";
   $header .= "Content-type: text/html\r\n";
   $retval = mail ($to,$subject,$message,$header);
   // message Notification
   if( $retval == true ) {
      echo json_encode(array(
         'success'=> true,
         'message' => 'Success'
      ));
   }else {
      echo json_encode(array(
         'error'=> true,
         'message' => 'Error'
      ));
   }
?>