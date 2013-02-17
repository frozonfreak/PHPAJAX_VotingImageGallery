$(document).ready(function() 
{
	$('body').append('<div class="dropdowndiv"></div><a href="#header" id="scroll">Top</a><div id="wrap"></div>');
	document.getElementById("wrap").innerHTML += '<h1 id="Header">Image | Gallery</h1>';
	document.getElementById("Header").innerHTML += '<div id="Uploader"><i class="icon-cloud-upload"></i></div>';
	document.getElementById("wrap").innerHTML += '<nav id="filter"></nav>';
	document.getElementById("wrap").innerHTML += '<ul id="gallery"></ul>';
	//Get Image Details from Server
	//Load Initial Images
	var n 		  = 0;
	var endOfFile = false;
	var ImageCounter = 0;
	var ImageArrayComplete = new Array();
	var UserArrayComplete  = new Array();
	var ImageLinkArray     = new Array();
	var slider			   = true;
	$.ajax({
			url: 'res/script/getImage.php', 
			type: 'POST',
			data: {
				param  : 'Load',
				browser: 'others',
				count  : n
			},
			success: function(result)
			{
				ImageArray = JSON.parse(result);
			   for(i=0; i<ImageArray.length; i++)
			    {
			    		var ImageElement = '<li id="image" data-tags="'+ImageArray[i].categ+'">';
			    		ImageElement 	+= '<a href="'+ImageArray[i].link+'" rel="lightbox">';
			    		ImageElement 	+= '<img src="'+ImageArray[i].thumb+'">';
			    		ImageElement 	+= '<div id="Title">'+ImageArray[i].title+'</div>';
			    		ImageElement 	+= '<div id="category">'+ImageArray[i].categ+'</div>';
			    		ImageElement 	+= '</a>';
			    		ImageElement 	+= '<div id="FeedBackInfo">';
			    		ImageElement 	+= '<div class="Spam" id="Spam-'+i+'" title="Report Abuse">';
			    		ImageElement 	+= '<i class="icon-exclamation-sign" id="'+i+'"> </i>';
			    		ImageElement 	+= '</div>';
			    		ImageElement 	+= '<div class="Vote" id="Vote-'+i+'" title="Vote">';
			    		ImageElement 	+= '<i class="icon-heart" id="'+i+'"> </i>';
			    		ImageElement 	+= '</div>';
			    		ImageElement 	+= '<div class="VoteCount" id="VoteCount-'+i+'">'+ImageArray[i].vote+'</div>';
			    		ImageElement 	+= '</div>';
			    		ImageElement 	+= '</li>';

	                    document.getElementById("gallery").innerHTML += ImageElement;
	                    ImageArrayComplete[ImageCounter] = ImageArray[i].image;
	                    UserArrayComplete[ImageCounter]  = ImageArray[i].user;
	                    ImageCounter++;
	         	}
	         updateFilter();
	        if(ImageArray.length<12)endOfFile = true;
	        }
		});
	/*$(window).scroll(function() 
		{
	   		if($(window).scrollTop() + $(window).height() == $(document).height() && !endOfFile)
	   		{
	   			console.log(n);
	   			n += 12;
	       		$.ajax({
			    		url: 'res/script/getImage.php', 
			    		type: 'POST',
			    		data: {
							param  : 'Load',
							browser: 'others',
							count  : n
					},
				    success: function(result)
				    {
				    	ImageArray = JSON.parse(result);
				    	if(ImageArray[ImageArray.length-1].EOF == "true") endOfFile = true;
				    	for(i=0; i<ImageArray.length; i++)
			    		{
	                    	var ImageElement = '<li id="image" data-tags="'+ImageArray[i].categ+'">';
				    		ImageElement 	+= '<a href="'+ImageArray[i].link+'" rel="lightbox">';
				    		ImageElement 	+= '<img src="'+ImageArray[i].thumb+'">';
				    		ImageElement 	+= '<div id="Title">'+ImageArray[i].title+'</div>';
				    		ImageElement 	+= '<div id="category">'+ImageArray[i].categ+'</div>';
				    		ImageElement 	+= '</a>';
				    		ImageElement 	+= '<div id="FeedBackInfo">';
				    		ImageElement 	+= '<div id="Spam" title="Report Spam">';
				    		ImageElement 	+= '<i class="icon-exclamation-sign"> </i>';
				    		ImageElement 	+= '</div>';
				    		ImageElement 	+= '<div class="Vote" id="Vote" title="Vote">';
				    		ImageElement 	+= '<i class="icon-heart"> </i>';
				    		ImageElement 	+= '</div>';
				    		ImageElement 	+= '<div id="VoteCount">'+ImageArray[i].vote+'</div>';
				    		ImageElement 	+= '</div>';
				    		ImageElement 	+= '</li>';

		                    document.getElementById("gallery").innerHTML += ImageElement;
		                    ImageArrayComplete[ImageCounter] = ImageArray[i].image;
		                    UserArrayComplete[ImageCounter]  = ImageArray[i].user;
		                    ImageCounter++;
	                	}
	                	if(ImageArray.length<12)endOfFile = true;
	                	$('#gallery img').each(function() {
	    					createCanvas(this);
	  					});
				    }
				});
	   		}
	   		if($(window).scrollTop() < 100){
	   			$('#scroll').css("display","none");
	   		}
	   		else if($(window).scrollTop() > 400){
	   				$("#scroll").css("display", "block");
			}
		});*/

	//Voting
	$('#gallery').on('click', '.icon-heart', function(e)
	{
    		$.ajax({
			    		url: 'res/script/getImage.php', 
			    		type: 'POST',
			    		data: {
			    			param: 'Vote',
			    			user : UserArrayComplete[e.target.id],
			    			image: ImageArrayComplete[e.target.id]
			    		},
			    		success: function(result)
			    		{
			    			//alert(result);
			    			VotingArray = JSON.parse(result);
			    			console.log(VotingArray.Status);
			    			if(VotingArray.Status == "Success")
			    			{
			    				$('#VoteCount-'+e.target.id).html(VotingArray.VoteCount);
			    				alert("Voted");
			    			}
			    			else if(VotingArray.Status == "Fail")
			    				alert("You have already voted for this image");
			    			else if(VotingArray.Status == "Error")
			    				alert("Unable register the vote, Try after sometime");
			    			else if(VotingArray.Status == "Same User")
			    				alert("You cant vote for your image");
			    		}
				});
		});
	//Abuse Report
	$('#gallery').on('click', '.icon-exclamation-sign', function(e)
	{
		$.ajax({
			    		url: 'res/script/getImage.php', 
			    		type: 'POST',
			    		data: {
			    			param: 'Report',
			    			user : UserArrayComplete[e.target.id],
			    			image: ImageArrayComplete[e.target.id]
			    		},
			    		success: function(result)
			    		{
			    			StatusMessage = JSON.parse(result);
			    			alert(StatusMessage.Status);
			    		}
				});
	});
	$('#wrap').on('click' , '.icon-cloud-upload', function(e)
	{
		if(slider)
		{
			$('#output').html("");
			$("#UploadForm").slideDown(500);
			var progressbox 	= $('#progressbox');
			var progressbar 	= $('#progressbar');
			var statustxt 		= $('#statustxt');
			var submitbutton 	= $("#SubmitButton");
			var myform 			= $("#UploadForm");
			var output 			= $("#output");
			var completed 		= '0%';
			
					$(myform).ajaxForm({
						beforeSend: function() { //brfore sending form
							submitbutton.attr('disabled', ''); // disable upload button
							statustxt.empty();
							progressbox.show(); //show progressbar
							progressbar.width(completed); //initial value 0% of progressbar
							statustxt.html(completed); //set status text
							statustxt.css('color','#000'); //initial color of status text
						},
						uploadProgress: function(event, position, total, percentComplete) { //on progress
							progressbar.width(percentComplete + '%') //update progressbar percent complete
							statustxt.html(percentComplete + '%'); //update status text
							if(percentComplete>50)
								{
									statustxt.css('color','#222'); 
								}
							},
						complete: function(response) { // on complete
							output.html(response.responseText); //update element with received data
							myform.resetForm();  // reset form
							submitbutton.removeAttr('disabled'); //enable submit button
							progressbox.hide(); // hide progressbar
							$("#UploadForm").slideUp(500);
						}
				});
			slider = false;
		}
		else
		{
			$("#UploadForm").slideUp(500);
			slider = true;
		}

	});
});


//Add filter details
function updateFilter()
{
	//Set the category filter menu
	//Category Fiter
	var items = $('#gallery li'),
		itemsByTags = {};

	items.each(function(i) {
		var elem = $(this);
		var	tags = elem.data('tags').split(',');

		elem.attr('data-id',i);
			$.each(tags,function(key,value){
			value = $.trim(value);
			if(!(value in itemsByTags)){
				itemsByTags[value] = [];
			}
			itemsByTags[value].push(elem);
		});
	});
	// Creating the "Everything" option in the menu:
	createList('All',items);

	// Looping though the arrays in itemsByTags:
	$.each(itemsByTags,function(k,v){
		createList(k,v);
	});

	$('#filter a').live('click',function(e){
		var link = $(this);

		link.addClass('active').siblings().removeClass('active');

		// Using the Quicksand plugin to animate the li items.
		// It uses data('list') defined by our createList function:

		$('#gallery').quicksand(link.data('list').find('li'));

		//Create Canvas
		$('#gallery img').each(function() {
			createCanvas(this);
		});
		e.preventDefault();
	});

	// Selecting the first menu item by default:
	$('#filter a:first').click();
}

//Create grayscale canvas on top of Image
function createCanvas(image) 
{
	var canvas = document.createElement('canvas');
	 if (canvas.getContext) 
	 {
	 	var ctx = canvas.getContext("2d");

	    // specify canvas size
	    canvas.width = image.width;
	    canvas.height = image.height;

	    // Once we have a reference to the source image object we can use the drawImage(reference, x, y) method to render it to the canvas. 
		//x, y are the coordinates on the target canvas where the image should be placed.
	    ctx.drawImage(image, 0, 0);

	    // Taking the image data and storing it in the imageData array. You can read the pixel data on a canvas using the getImageData() method. Image data includes the colour of the pixel (decimal, rgb values) and transparency (alpha value). Each color component is represented by an integer between 0 and 255. imageData.da contains height x width x 4 bytes of data, with index values ranging from 0 to (height x width x 4)-1.
	    var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
	        pixelData = imageData.data;

	    // Loop through all the pixels in the imageData array, and modify
	    // the red, green, and blue color values.
	    for (var y = 0; y < canvas.height; y++) 
	    {
	    	for (var x = 0; x < canvas.width; x++) {

	          // You can access the color values of the (x,y) pixel as follows :
	          var i = (y * 4 * canvas.width) + (x * 4);

	          // Get the RGB values.
	          var red = pixelData[i];
	          var green = pixelData[i + 1];
	          var blue = pixelData[i + 2];

	          // Convert to grayscale. One of the formulas of conversion (e.g. you could try a simple average (red+green+blue)/3)   
	          var grayScale = (red * 0.3) + (green * 0.59) + (blue * .11);

	          pixelData[i] = grayScale;
	          pixelData[i + 1] = grayScale;
	          pixelData[i + 2] = grayScale;
	        }
	      }

	    // Putting the modified imageData back on the canvas.
	    ctx.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height);

	    // Inserting the canvas in the DOM, before the image:
	    image.parentNode.insertBefore(canvas, image);
	  }
}
function createList(text,items){

	// This is a helper function that takes the
	// text of a menu button and array of li items

	// Creating an empty unordered list:
	var ul = $('<ul>',{'class':'hidden'});

	$.each(items,function(){
		// Creating a copy of each li item
		// and adding it to the list:

		$(this).clone().appendTo(ul);
	});

	ul.appendTo('#container');

	// Creating a menu item. The unordered list is added
	// as a data parameter (available via .data('list')):
	var a = $('<a>',{
		html: text,
		href:'#',
		data: {list:ul}
	}).appendTo('#filter');
}