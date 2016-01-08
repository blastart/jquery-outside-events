/*!
 * jQuery outside events - v1.x - 1/08/2016
 * http://benalman.com/projects/jquery-outside-events-plugin/
 *
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

(function($,doc,outside){
  '$:nomunge'; // Used by YUI compressor.

  $.map(
    // All these events will get an "outside" event counterpart by default.
    'click dblclick mousemove mousedown mouseup mouseover mouseout touchstart touchend touchmove change select submit keydown keypress keyup'.split(' '),
    function( event_name ) { jq_addOutsideEvent( event_name ); }
  );

  // The focus and blur events are really focusin and focusout when it comes
  // to delegation, so they are a special case.
  jq_addOutsideEvent( 'focusin',  'focus' + outside );
  jq_addOutsideEvent( 'focusout', 'blur' + outside );
  // Method: jQuery.addOutsideEvent
  // > jQuery.addOutsideEvent( event_name [, outside_event_name ] );


  $.addOutsideEvent = jq_addOutsideEvent;

  function jq_addOutsideEvent( event_name, outside_event_name ) {

    // The "outside" event name.
    outside_event_name = outside_event_name || event_name + outside;

    // A jQuery object containing all elements to which the "outside" event is
    // bound.
    var elems = [],

      // The "originating" event, namespaced for easy unbinding.
    event_namespaced = event_name + '.' + outside_event_name + '-special-event';

    $.event.special[ outside_event_name ] = {

      // Called only when the first "outside" event callback is bound per
      // element.
      setup: function(){

        // Add this element to the list of elements to which this "outside"
        // event is bound.
        elems.push( this );

        // If this is the first element getting the event bound, bind a handler
        // to document to catch all corresponding "originating" events.
        if ( elems.length === 1 ) {
          $(doc).on( event_namespaced, handle_event );
        }
      },

      // Called only when the last "outside" event callback is unbound per
      // element.
      teardown: function(){
        var index;
        // Remove this element from the list of elements to which this
        // "outside" event is bound.
        if ( (index = $.inArray(this, elems))  !==  -1 ) {
          elems.splice( index, 1 );
        }
        // If this is the last element removed, remove the "originating" event
        // handler on document that powers this "outside" event.
        if ( elems.length === 0 ) {
          $(doc).off( event_namespaced );
        }
      },

      // Called every time a "outside" event callback is bound to an element.
      add: function( handleObj ) {
        var old_handler = handleObj.handler;
        // This function is executed every time the event is triggered. This is
        // used to override the default event.target reference with one that is
        // more useful.
        handleObj.handler = function( event, elem ) {

          // Set the event object's .target property to the element that the
          // user interacted with, not the element that the "outside" event was
          // was triggered on.
          event.target = elem;
          // Execute the actual bound handler.
          old_handler.apply( this, arguments );
        };
      }
    };

    // When the "originating" event is triggered..
    function handle_event( event ) {
      // Iterate over all elements to which this "outside" event is bound.
      for (var i=0, l=elems.length; i<l;i++) {
        var elem = elems[i];
        var $elem = $(elem);
        // If this element isn't the element on which the event was triggered,
        // and this element doesn't contain said element, then said element is
        // considered to be outside, and the "outside" event will be triggered!
        if ( elem !== event.target && !$elem.has(event.target).length ) {

          // Use triggerHandler instead of trigger so that the "outside" event
          // doesn't bubble. Pass in the "originating" event's .target so that
          // the "outside" event.target can be overridden with something more
          // meaningful.
          $elem.triggerHandler( outside_event_name, [ event.target, event ] );
        }

      }

    }

  }

})(jQuery,document,"outside");
