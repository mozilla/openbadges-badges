var hashParams = {};
var docroot = '/moz/obb';
getHashParams()

$(document).ready(function() {

  if (hashParams.hasOwnProperty('badgedetail')) { 
    makeModal($('a.'+hashParams.badgedetail));
  }
  //the click function for lists of badge thumbnails
  $( 'body' ).delegate( "a", "click", function() {


    var target = $( this );
    var hashOrAction = $( this ).attr('class').split(' ')[1];
    var ui = 0;
    if (target.hasClass('badgethumb')) { ui = 'badge'; } 
    else if (target.hasClass('collectionthumb')) { ui = 'collection'; }
    
    //close reveal
    if (target.hasClass('closereveal')) {
      $('#myModal').foundation('reveal', 'close');
    }
    //Display badge content and BadgeUI for clicked badge
    if (ui != 0) {

      //check for other chosen items and close them
      if($('.chosen').length > 0 ) {
        $('.chosen').each(function(){
          if(!$(this).hasClass(hashOrAction)) {
            var thisTarget = $(this);
            $(this).find('.detail').animate({
              top: "150px"
            }, 400, "swing", function(){
              thisTarget.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
                $(this).remove();
              });
            });
          }
        });
      }

      //for square thumbnail badges
      if(target.parents('ul').hasClass('square')){
        if (target.hasClass('chosen')) {
          $(target).find('.detail').animate({
            top: "150px"
          }, 400, "swing", function(){
            target.removeClass('chosen').parents('li').find('.ui').fadeOut('fast', function() {
              $(this).remove();
            });
          });
        } else {
          $(target).find('.detail').animate({
            top: "0px"
          }, 400, "swing", function(){
            ui = makeUI(target)
            target.addClass('chosen').parents('li').append(ui).find('.ui').fadeIn('fast');
          });
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
  } else if (target.hasClass('badgerow')){
    makeReveal(target);
  } else if (target.hasClass('replaceModal')) {
      
      var output= makeBadgeAcceptance('badgehash-x');

      $('#myModal').html(output);

    return false;
  } else if (target.hasClass('replaceModal')) {
  } else {
    console.log('some other link');
  }

  });

  //a function to generate the dropdown BadgeUI from the clicked badge hash
  function makeUI(element) {
    var what = 'badge'; //there may be other UIs to make in the future
    var hash = element.attr('class').split(' ')[1];
    var type = element.attr('class').split(' ')[2];

    console.log('making a ' + what + ' ui for : ' + hash);
    var output = '' +
    '<div class="' + what + 'ui ui">' +
    ' <ul>';

      if(what == 'badge') {
        if(type == 'bgiv') { output += '<li><a class="badge_action bgiv ' + hash + ' button small" href="#">Give</a></li>' }
          else {
             output += '<li><a class="badge_action bapp ' + hash + ' button small" href="#">Apply</a></li>';
          }
        output += '<li><a class="badge_action bdet ' + hash + '" href="#">Detail</a></li>';

      } else {
        //future UIs to go here
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
    } else if (action == 'bgiv') {
      makeModal(element);
    } else if (action == 'bapp') {
      makeModal(element);
    } else if (action == 'babp') {
      acceptBadge(hash);
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
    var hash = element.attr('class').split(' ')[2],
    elemPosition = element.parent().offset().left,
    bodyWidth = $('body').offset().width,
    parentUL;

    if(element.parents('.grid').length) {
      parentUL = element.parents('.grid');
    } else {
      parentUL = $('.grid').first();
    }

    var firstli = parentUL.find('li:first-child').find('a').offset(),
    xpos = firstli.left,
    ypos = firstli.top,
    firstli_w = firstli.width,
    firstli_h = firstli.height,
    numRows = calculateLIsInRow(parentUL.children('li')),
    height = firstli_h,
    width = firstli_w;

    console.log('element position is : ' + elemPosition);
    console.log('body width is : ' + bodyWidth);

    if(numRows != 3 && numRows != 1) {
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

  if (element.is('.bdet')) {
    var details = retrieveBadge(element.attr('class').split(' ')[2]);
  }
  else if (element.is('.bgiv')) {
    var details = retrieveGive(element.attr('class').split(' ')[2]);
  }
  else if (element.is('.bapp')) {
    var details = retrieveApply(element.attr('class').split(' ')[2]);
  } else {
    console.log('FATAL MODAL ERROR');
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

  function makeReveal(content){
    $('#myModal').html(content).foundation('reveal', 'open');
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

  var output = '<div class="fullbadge">' +
  '<h3>Some Badge</h3>' +
  '<img src="' + docroot + '/img/badge/badgehash-x-l.png">' +
  '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>' +
  '<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>' +
  '</div>';
  return output;
}

function retrieveApply(hash) {

  var output = '<div class="fullbadge">' +
  '<h3>Apply for Some Badge</h3>' +
  '<img src="' + docroot + '/img/badge/badgehash-x-l.png">' +
  '<h4>Check out the criteria for this badge before you begin:</h4>' +
  '<ul><li>Some criteria</li><li>Some criteria</li><li>Some criteria</li></ul>' +
  '<h4>Tell us more about your work:</h4>' +
  '<textarea></textarea>' +
  '<h4>Your E-mail:</h4>' +
  '<input type="text">' +
  '<a class="badge_action bsub badgehash-d button medium" href="#">Submit</a>'+
  '<br>Link: <a target=_blank href="http://proto.ballard.is'+docroot+'/'+'#badgedetail='+hash+'">http://proto.ballard.is/'+docroot+'/'+'#badgedetail='+hash+'</a>'
  '</div>';
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