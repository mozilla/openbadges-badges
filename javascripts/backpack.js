var hashParams = {};
var docroot = '/moz/backpack';
getHashParams()


$(document).ready(function() {

  $.timeago.settings.allowFuture = true;

  if (hashParams.hasOwnProperty('newbadges')) { 
    makeAlert("You've added " + hashParams.newbadges + " badges to your Backpack!",'success');
  }

  //the click function for lists of badge thumbnails
  $( 'body' ).delegate( "a", "click", function() {

    if($('.logged-out').length != 0) {
      makeAlert('Please <a class="button small" href="persona.html">log in</a> to make changes to your badges.','alert');
      return false;
    }
    var target = $( this );
    var hashOrAction = $( this ).attr('class').split(' ')[1];
    var ui = 0;
    if (target.hasClass('badgethumb')) { ui = 'badge'; } 
    else if (target.hasClass('collectionthumb')) { ui = 'collection'; }
    //Display badge content and BadgeUI for clicked badge
    if (ui != 0) {

      if($('.chosen').length > 0 ) {
        $('.chosen').each(function(){
          if(!$(this).hasClass(hashOrAction)) {
            var thisTarget = $(this);
            $(this).find('.detail').animate({
              top: "160px"
            }, 400, "swing", function(){
              thisTarget.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
                $(this).remove();
              });
            });
          }
        });
      }


      //for square thumbnal badges
      if(target.parents('ul').hasClass('square')){
        if (target.hasClass('chosen')) {
          $(target).find('.detail').animate({
            top: "160px"
          }, 400, "swing", function(){
            target.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
              $(this).remove();
            });
          });
        } else {
          $(target).find('.detail').animate({
            top: "0px"
          }, 400, "swing", function(){
            ui = makeUI(hashOrAction,ui)
            target.addClass('chosen').parents('li').append(ui).find('.ui').fadeIn('fast');
          });
        }
      //for vertical thumbnail badges (in lists)
      } else if (target.parents('ul').hasClass('vertical')) {
        //SOMEB BUG HERE - WHEN YOU TOGGLE VISIBLE A BUNCH OF VERTICALS THEN TOGGLE INVISI ALL DISAPPEAR
        if (target.hasClass('chosen')) {
          target.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
              $(this).remove();
            });
        } else {
          ui = makeUI(hashOrAction,ui)
          target.addClass('chosen').parent().append(ui).find('.ui').fadeIn('fast');
        }


      }
    return false;
  //Perform action based on clicked Badge UI item
  } else if (target.hasClass('badge_action')) {
    badgeAction(target);
    if(!target.hasClass('bcol')) return false;
  } else if (target.hasClass('collection_action')) {
    collectionAction(target);
    if(!target.hasClass('csha')) return false;
  } else if (target.hasClass('toggle')) {
    //console.log(hashOrAction);
    $('#'+hashOrAction).fadeToggle();
    return false;
  } else {
    console.log('some other link');
  }
  });

  //a function to generate the dropdown BadgeUI from the clicked badge hash
  function makeUI(hash,what) {
    console.log('making a ' + what + ' ui for : ' + hash);
    var output = '' +
    '<div class="' + what + 'ui ui">' +
    ' <ul>';

      if(what == 'badge') {
        output += '' +
        '   <li><a class="badge_action bdel ' + hash + '" href="#">Delete</a></li>' +
        '   <li><a class="badge_action bcol ' + hash + '" data-dropdown="' + hash + '_coll_dd" href="#">Collections</a>' +
        '      <ul id="' + hash + '_coll_dd" class="f-dropdown" data-dropdown-content>' +
                  getCollectionsByBadge(hash,'li') +
        '         <li class="divider"><hr></li>' +
        '         <li><a class="toggle ' + hash + '_batc_dd" href="#"><span class="title">Add to new or existing collection</span></a>' +
        '            <ul style="display:none;" class="submenu" id="' + hash + '_batc_dd">' +
        '               <li><input type="text" placeholder="Enter a title..." name="newcollection"></li>' +
                        getCollections(hash,'li') +
        '            </ul>' +
        '         </li>' +
        '      </ul>' +
        '   </li>' +
        '   <li><a class="badge_action bdet ' + hash + '" href="#">Detail</a></li>';
      } else {
      output += '' +
        '   <li><a class="collection_action cdel ' + hash + '" href="#">Delete</a></li>' +
        '   <li><a class="collection_action csha ' + hash + '" target=_blank href="' + docroot + '/userhash/collectionhash-x.html">Share</a></li>' +
        '   <li><a class="collection_action cedi ' + hash + '" href="#">Edit</a></li>';    
      }

  output += '' +
    ' </ul>' +
    '</div>';

    return output;

  }

  //a function to process BadgeUI clicks (details,delete,etc.)
  function badgeAction(element) {

  var action = element.attr('class').split(' ')[1];
  var hash = element.attr('class').split(' ')[2];

  console.log('action is : ' + action);
  console.log('target is : ' + hash);

  if (action == 'bdel') {
    if((element.parents('.collection').length) > 0) {

      var parent = element.parents('.collection')[0];
      makeAlert('Are you sure you want to delete ' + $('.' + hash + ' .title').html() + ' from ' + $(parent).find('.title').html() + '?','alert');
    
    } else {
    makeAlert('Are you sure you want to delete ' + $('.' + hash + ' .title').html() + '?','alert');
  }
    } else if (action == 'bdet') {
      makeModal(element);
    } else if (action == 'bcol') {
      console.log(element);
    } else if (action == 'batc') {
      var collection = element.attr('class').split(' ')[3];
      makeAlert('Are you sure you want to add ' + $('.' + hash + ' .title').html() + ' to ' + $('.' + collection + ' .title').html() + '?','warning');
    } else {
      console.log('no idea...')
    }
  }

  //a function to process collectionUI clicks (details,delete,etc.)
  function collectionAction(element) {

  var action = element.attr('class').split(' ')[1];
  var hash = element.attr('class').split(' ')[2];

  console.log('action is : ' + action);
  console.log('target is : ' + hash);

  if (action == 'cdel') {
    console.log(hash);
    makeAlert('Are you sure you want to delete ' + $('.' + hash + ' .title').html() + '?','alert');
    } else if (action == 'cedi') {
      makeModal(element);
    } else {
      console.log('no idea...')
    }
  }
  //a function to create an alert box element and add to the DOM
  function makeAlert(text,status) {
    if($('.alert-box').length != 0) {
      $('.alert-box').remove();
    }
    var alert = '<div data-alert class="alert-box ' + status + '"><span class="content">' + text + '</span><a href="#" class="close">&times;</a></div>';
    $(alert).prependTo($('body')).fadeIn('fast');
  }

  //a function to get badge details and display them in a modal
  //display modal to the left,right,or over the list itself depending on circumstances
  function makeModal(element) {
    elemPosition = element.parent().offset().left;
    bodyWidth = $('body').offset().width;

    console.log('element position is : ' + elemPosition);
    console.log('body width is : ' + bodyWidth);


    var parentUL;

    if(element.parents('.grid').length) {
      parentUL = element.parents('.grid');
    } else {
      parentUL = $('.grid').first();
    }

    var firstli = parentUL.find('li:first-child').find('a').offset();
    var xpos = firstli.left;
    var ypos = firstli.top;
    var firstli_w = firstli.width;
    var firstli_h = firstli.height;
    var numRows = calculateLIsInRow(parentUL.children('li'));
    var height = firstli_h;
    var width = firstli_w;

    if(numRows != 3) {
      width = ((firstli_w * 2) + 20);
      height = ((firstli_h * 2) + 20);
      //display on the right if element is on the left
    if(numRows == 1) { height*=2; width=firstli_w; }
    if(elemPosition < (bodyWidth / 2) && (numRows == 4)) xpos = (xpos + width + 20);
    } else if(numRows == 3){
      width = ((firstli_w * 1.5) + 20);
      height = ((firstli_h * 4) + 30);
       //display on the right if element is on the left
      if(elemPosition < (bodyWidth / 2)) xpos = (xpos + firstli_w + 20);
    } else {
      console.log("no idea how to display modal");
    }


   if (element.is('.collection_action')) {
    var details = retrieveCollection(element.attr('class').split(' ')[2]);
   }
  else if (element.is('.badge_action')) {
    var details = retrieveBadge(element.attr('class').split(' ')[2]);
  }
    var close = $('<a href="#" class="close">×</a>').click(function(){$('#badge_modal').remove();return false});
    var inner = $('<div style="top:' + ypos + 'px;left:' + xpos + 'px;width:' + width + 'px;min-height:' + height + 'px;" id="badge_modal_inner"></div>');
    var outer = $('<div id="badge_modal"></div>');

    outer.append(inner.append(details,close));
    
    if($('#badge_modal').length != 0) {
      $('#badge_modal').remove();
    }
    outer.appendTo('body').fadeIn('fast');
  }

  //a function to return the number of list items in a row (good for responsive lists)
  function calculateLIsInRow(element) {
    var lisInRow = 0;
    element.each(function() {
        if($(this).prev().length > 0) {
            if($(this).position().top != $(this).prev().position().top) return false;
            lisInRow++;
        }
        else {
            lisInRow++;   
        }
    });
    console.log('number of lis in row : ' + lisInRow);
    return lisInRow;
  }

//a function to retrieve full badge details - ideally via Ajax - then format for display
function retrieveBadge(hash) {
  //here is a dummy object
  hash = 'badgehash-a';
  badge=new Object();
  badge.hash=hash;
  badge.name="Some Badge";
  badge.org="Some Organization";
  badge.url_org="some-org.org";
  badge.issue=1346760732;
  badge.expire=1389484800;
  badge.url_criteria="some-org.org/criteria";
  badge.url_evidence="some-org.org/evidence";
  badge.desc="<p>Here is the user's description of the badge.";
  badge.collections='{ "collName":"Collection A" , "collHash":"123" },{ "collName":"Collection B" , "collHash":"456" }';

  var output = '<div class="fullbadge">' +
  '<h3>' + badge.name + '</h3>' +
  '<img src="' + docroot + '/img/badge/' + hash + '-l.png">' +
  '<p>Issued by : <br><strong><a class="redirect ' + collection_hash1 + '" href="' + docroot + '/badge/by-organization/organizationhash-x.html">' + badge.org + '</a></strong><br>' + badge.url_org + '</p>' +
  '<p>Issued ' + $.timeago(dateFromUnix(badge.issue)) + '.</p>' +
  '<p>Expires ' + $.timeago(dateFromUnix(badge.expire)) + '.</p>' +
  '<p>Description : <br>' + badge.desc + '</p>' +
  '<p>Criteria : <a href="http://' + badge.url_criteria + '" target=_blank>' + badge.url_criteria + '</a></p>' +
  '<p>Evidence : <a href="http://' + badge.url_evidence + '" target=_blank>' + badge.url_evidence + '</a></p>' +
  '</div>';
  return output;
}

function retrieveCollection(hash) {
  //here is a dummy object
  hash = 'collectionhash-x';
  collection=new Object();
  collection.hash=hash;
  collection.name="Collection X";
  collection.desc="<p>Here is the user's description of the collection.";
  collection.badges = {"badgehash-a": [
    {"name": "Badge A", "iss": "1346760732", "exp": "1389484800", "org": "Organization X"},
    ],
    "badgehash-b": [
    {"name": "Badge B", "iss": "1346760732", "exp": "1389484800", "org": "Organization X"},
    ],
    "badgehash-c": [
    {"name": "Badge C", "iss": "1346760732", "exp": "1389484800", "org": "Organization X"},
    ],
    "badgehash-d": [
    {"name": "Badge D", "iss": "1346760732", "exp": "1389484800", "org": "Organization X"},
    ],
    "badgehash-e": [
    {"name": "Badge E", "iss": "1346760732", "exp": "1389484800", "org": "Organization X"},
    ]
};
var output='<ul class="badge-thumbs vertical collection ' + hash + ' grid"><li class=title> ' + collection.name + ' </li><li></h4>' + collection.desc + '</h4></li>';
$.each(collection.badges, function(index, value) {
//<li><a class="' + index + '" href="#">' + value[0].name + ' expires ' + $.timeago(dateFromUnix(value[0].expiry)) + '</li>';
    output+='<li>'+
              '<a class="badgethumb badgehash-f" href="#" style="background-image:url(' + docroot + '/img/badge/' + index + '-s.png);">'+
                '<span class="detail">'+
                  '<span class="title">' + value[0].name + '</span>'+
                  '<span class="content">Issued ' + $.timeago(dateFromUnix(value[0].iss)) + ' by <em>' + value[0].org + '</em>.<br>Expires <em>' + $.timeago(dateFromUnix(value[0].exp)) + '</em></span>' +
                '</span>'+
              '</a>'+
            '</li>';

}); 
output+="</ul>";
return output;
}

function dateFromUnix(timestamp) {
  var date = new Date(timestamp * 1000);
  return date;
}

//a function to retrieve all a users collections containting a specified badge
function getCollectionsByBadge(hash,style) {
  //fetch collection hash and names
  collection_hash1="collectionhash-a";
  collection_hash2="collectionhash-b";
  collection_hash3="collectionhash-c";

  var output = '' +
  '<li><a class="badge_action brfc ' + hash + ' ' + collection_hash1 + '" href="#">x</a><a class="redirect ' + collection_hash1 + '" href="' + docroot + '/badge/by-collection/collectionhash-x.html"><span class="title">Collection A</span></a></li>' +
  '<li><a class="badge_action brfc ' + hash + ' ' + collection_hash2 + '" href="#">x</a><a class="redirect ' + collection_hash2 + '" href="' + docroot + '/badge/by-collection/collectionhash-x.html"><span class="title">Collection B</span></a></li>' +
  '<li><a class="badge_action brfc ' + hash + ' ' + collection_hash3 + '" href="#">x</a><a class="redirect ' + collection_hash3 + '" href="' + docroot + '/badge/by-collection/collectionhash-x.html"><span class="title">Collection C</span></a></li>';
  
  return output;
}
//a function to retrieve all a users collections
function getCollections(hash,style) {
  //fetch collection hash and names
  collection_hash1="collectionhash-d";
  collection_hash2="collectionhash-e";
  collection_hash3="collectionhash-f"; 

  var output = '' +
  '<li><a class="badge_action batc ' + hash + ' ' + collection_hash1 + '" href="#">Add to <span class="title">Collection D</title></a></li>' +
  '<li><a class="badge_action batc ' + hash + ' ' + collection_hash2 + '" href="#">Add to <span class="title">Collection E</title></a></li>' +
  '<li><a class="badge_action batc ' + hash + ' ' + collection_hash3 + '" href="#">Add to <span class="title">Collection F</title></a></li>';

  return output;  
}

});

function getHashParams() {

    var e,
        a = /\+/g,  // Regex for replacing addition symbol with a space
        r = /([^&;=]+)=?([^&;]*)/g,
        d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
        q = window.location.hash.substring(1);

    while (e = r.exec(q))
       hashParams[d(e[1])] = d(e[2]);
     console.log(hashParams);
    return hashParams;
}