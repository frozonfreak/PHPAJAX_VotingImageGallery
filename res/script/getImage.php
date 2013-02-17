<?php

//Value to be obtained from Session variable
$UserID     = 1234;

if(isset($_POST))
{
    if($_POST['param'] == 'Load')
    {
        //Some common parameters
        $ContestID      = 4567;             //Contest ID for which gallery is to be built
        $ContestFolder  ='contestentry';    //Folder for all Images
        $ThumbName      ='thumb_';          //prefix of thumbnails
        //Check for webkit support
        if($_POST['browser'] == 'webkit')
        {
            $ImageArray = RetrieveFromDB($ContestID, $ContestFolder, $ThumbName);
            echo $ImageArray;
        }
        //Fall Back gallery
        else if($_POST['browser'] == 'others')
        {
            $count = filter($_POST["count"]);
            //$ImageArray = RetrieveFromDBWithCount($ContestID, $ContestFolder, $ThumbName, $count);
            $ImageArray = RetrieveFromDB($ContestID, $ContestFolder, $ThumbName);
            echo $ImageArray; 
        }
    }
    else if($_POST['param'] == 'Vote')
    {

        $ImageOwnerID  = $_POST['user'];

        $ImageID = $_POST['image'];

        $VoteStatus = "";
        $UpdatedVoteCount = 0;

        if($ImageOwnerID == $UserID)
            $VoteStatus = "Same User"; //User vote for his own image
        else
        {
            //Check if user has already voted for the particular image
            if(CheckVote($ImageID,$UserID))
            {
                if(UpdateVoteDB($ImageID, $ImageOwnerID, $UserID))
                    $VoteStatus = "Success";//Voting succesfull
                else
                    $VoteStatus ="Error";//Unable to register the vote
            }
            else
                $VoteStatus = "Fail";//User already vote for the image
        }
         $UpdatedVoteCount = getupdatedVoteCount($ImageID);
                $JsonArray = array(
                            "ImageID"   => $ImageID,
                            "VoteCount" => $UpdatedVoteCount,
                            "Status"    => $VoteStatus
                    );
            echo(json_encode($JsonArray));
    }
    else if($_POST['param'] == 'Report')
    {
        $ImageOwnerID  = $_POST['user'];
        $ImageID = $_POST['image'];

        $StatusMessage = "";

        if($ImageOwnerID == $UserID)
            $StatusMessage = "You cant report your own Image";//User try to report his own image
        else
        {
             if(CheckSpam($ImageID,$UserID))
            {
                if(UpdateSpamDB($ImageID, $ImageOwnerID, $UserID))
                    $StatusMessage = "Succesfully reported";//Succesfully reported 
                else
                    $StatusMessage = "Unable to report, Try after some time"; //Unable to write to DB
            }
            else
                $StatusMessage = "You have already reported this Image";//User already report this image
        }
        $JsonArray = array(
                    "ImageID" => $ImageID,
                    "Status"  => $StatusMessage
            );
        echo(json_encode($JsonArray));
    }
}

//Input argument validation - only numbers permitted
function filter($data) 
{
    if(is_numeric($data)) 
    {
        return $data;
    }
    else 
    { 
        header("Location: ../../index.html"); 
    }
}

//Retrieven data and convert to json array
function RetrieveFromDB($ContestID, $ContestFolder, $ThumbName)
{
    $TotalVotes = RetrieveVotesFromDB();
    require("config.php");
    $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql    = "SELECT  `IMGE_ID` ,  `USR_ID` ,  `IMGE_CPTION` , `IMGE_CAT` FROM  `IMAGES` WHERE  `CNTST_ID` = $ContestID";
    $result = mysql_query($sql);

    $JsonArray = array();
    while($row = mysql_fetch_array($result))
    {
        $ImageID        = $row['IMGE_ID'];
        $UserID         = $row['USR_ID'];
        $ImageCaption   = $row['IMGE_CPTION'];
        $ImageCategory  = $row['IMGE_CAT'];
        $VoteCount      = getVotes($ImageID, $TotalVotes);
        $FullImagePath  = $ContestFolder.'/'.$ContestID.'/'.$UserID.'/'.$ImageID.'.jpg';
        $ThumbImagePath = $ContestFolder.'/'.$ContestID.'/'.$UserID.'/'.$ThumbName.$ImageID.'.jpg';

        $EOF            = "true";
        $JsonFile       = array(
                                "title" => $ImageCaption,
                                "thumb" => $ThumbImagePath,
                                "link"  => $FullImagePath,
                                "zoom"  => $FullImagePath,
                                "categ" => $ImageCategory,
                                "user"  => $UserID,
                                "image" => $ImageID,
                                "vote"  => $VoteCount,
                                "EOF"   => $EOF
                            );
        array_push($JsonArray,$JsonFile);
    }
    mysql_close($con);
    return(json_encode($JsonArray));
}
//Retrieven data and convert to json array
function RetrieveFromDBWithCount($ContestID, $ContestFolder, $ThumbName, $count)
{
    $TotalVotes = RetrieveVotesFromDB();
    require("config.php");
    $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql = "SELECT COUNT( * ) FROM `IMAGES`";
    $result = mysql_query($sql);
    while($totalRecord = mysql_fetch_array($result))
    {
        $TotalRecordCount = $totalRecord['COUNT( * )'];
    }
    $final = $count+12;
    $EOF = ($TotalRecordCount < $final ? true : false);

    $sql = "SELECT  `IMGE_ID` ,  `USR_ID` ,  `IMGE_CPTION` , `IMGE_CAT` FROM  `IMAGES` WHERE  `CNTST_ID` = $ContestID LIMIT $count, $final";
    $result = mysql_query($sql);
    $JsonArray = array();
    while($row = mysql_fetch_array($result))
    {
        $ImageID        = $row['IMGE_ID'];
        $UserID         = $row['USR_ID'];
        $ImageCaption   = $row['IMGE_CPTION'];
        $ImageCategory  = $row['IMGE_CAT'];
        $VoteCount      = getVotes($ImageID, $TotalVotes);
        $FullImagePath  = $ContestFolder.'/'.$ContestID.'/'.$UserID.'/'.$ImageID.'.jpg';
        $ThumbImagePath = $ContestFolder.'/'.$ContestID.'/'.$UserID.'/'.$ThumbName.$ImageID.'.jpg';
        
        $JsonFile       = array(
                                "title" => $ImageCaption,
                                "thumb" => $ThumbImagePath,
                                "link"  => $FullImagePath,
                                "zoom"  => $FullImagePath,
                                "categ" => $ImageCategory,
                                "user"  => $UserID,
                                "image" => $ImageID,
                                "vote"  => $VoteCount,
                                "EOF"   => $EOF
                            );
        array_push($JsonArray,$JsonFile);
    }
    mysql_close($con);
    return(json_encode($JsonArray));
}
//Check if the vote has already been registered
function CheckVote($ImageID,$UserID)
{
    require("config.php");
     $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql = "SELECT COUNT( * ) FROM  `VOTES` WHERE  `IMAGE_ID` = $ImageID AND  `USR_NAME` = $UserID";
    $result = mysql_query($sql);

    while($row =mysql_fetch_array($result))
    {
        $Count = $row['COUNT( * )'];
    }
    mysql_close($con);
    return ($Count == 0? true:false);
}

//Update Vote details to database
function UpdateVoteDB($ImageID, $ImageOwnerID, $UserID) 
{
    require("config.php");
    $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    //$date = date('Y-m-d');
    //$voteDate = date('Y-m-d', strtotime($date));

    $sql = "INSERT INTO  `VOTES` (`IMAGE_ID` ,`USR_NAME`) VALUES ('$ImageID',  '$UserID')";
    if(!mysql_query($sql, $con))
    {
        mysql_close($con);
        return false;
    }
    mysql_close($con);
    return true;

}

function RetrieveVotesFromDB()
{
    require("config.php");
    $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql = "SELECT  `IMAGE_ID` , COUNT( * ) AS  `VOTES` FROM VOTES GROUP BY  `IMAGE_ID`";
    $result = mysql_query($sql);
    $TotalVotes = array();
    while($row = mysql_fetch_array($result))
    {
        array_push($TotalVotes, $row['IMAGE_ID'], $row['VOTES']);
    }
    mysql_close($con);
    return($TotalVotes);
}

function getVotes($ImageID,$TotalVotes)
{
    for($i = 0; $i<count($TotalVotes); $i++)
    {
        if($TotalVotes[$i] == $ImageID)
            return($TotalVotes[$i+1]);
    }
    return 0;
}

function getupdatedVoteCount($ImageID)
{
    require("config.php");
    $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql = "SELECT  COUNT( * ) AS  `VOTES` FROM VOTES WHERE `IMAGE_ID` = '$ImageID'";
    $result = mysql_query($sql);
    while($row = mysql_fetch_array($result))
    {
        $voteCount = $row['VOTES'];
    }
    mysql_close($con);
    return($voteCount);
}

//Check if the vote has already been registered
function CheckSpam($ImageID,$UserID)
{
    require("config.php");
     $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $sql = "SELECT COUNT( * ) FROM  `SPAM` WHERE  `IMAGE_ID` = $ImageID AND  `REPORT_ID` = $UserID";
    $result = mysql_query($sql);

    while($row =mysql_fetch_array($result))
    {
        $Count = $row['COUNT( * )'];
    }
    mysql_close($con);
    return ($Count == 0? true:false);
}

//Update the SPAM details to DB
function UpdateSpamDB($ImageID, $ImageOwnerID, $UserID)
{
    require("config.php");
     $con = mysql_connect($mySqlServer, $mySqlUserName, $mySqlPass);
    if (!$con) die('Could not connect: ' . mysql_error());
   
    mysql_select_db($mySqlTable, $con);

    $date = date('Y-m-d');
    $reportDate = date('Y-m-d', strtotime($date));

    $sql = "INSERT INTO  `SPAM` (`REPORT_ID` ,`OWNR_ID` , `IMAGE_ID`, `TIME_STAMP` ) VALUES ('$UserID',  '$ImageOwnerID', '$ImageID', '$reportDate')";
    if(!mysql_query($sql, $con))
    {
        mysql_close($con);
        return false;
    }
    mysql_close($con);
    return true;
}
?>