$.fn.is_html5_storage = function(){
  return ('localStorage' in window) && window['localStorage'] !== null;
}

$.fn.testme = function(msg) {
  alert(msg);
}

//JSON Paresr
$.fn.parse_obj = function(obj){
  return JSON.parse(obj)
}

//Tasks
$.fn.get_tasks = function(){
  return $.fn.parse_obj(localStorage['tasks']);
}

//Titles
$.fn.task_index = function(){
  var arr = [];
  if(localStorage.length > 0){
    var tasks = $.fn.get_tasks();
    for(var key in tasks){
      var task = $.fn.parse_obj(tasks[key]);
      arr.push(task['title']);
    }
  }
 return arr;
}

//Count
$.fn.task_count = function(){
  return $.fn.task_index().length;
}

$.fn.create_tile = function(task_uuid, task_title , task_color, task_created_at){
  var new_tile = "<div id='"+ task_uuid +"' class='tilebox "+ task_uuid +"' style='position:relative;background-color:"+task_color+";'>";
  new_tile = new_tile + "<a href='#' class='close'>X</a>";
  new_tile = new_tile + "<div class='edit' style='position:relative;width:90%'>" + task_title + "</div>";
  new_tile = new_tile + "<div class='datetime'>" + task_created_at + "</div>";
  new_tile = new_tile + "</div>";
  $('#tiles_container').append(new_tile).css( 'display', 'block');
}

$.fn.create_tile_list = function(task_uuid, task_title){
  var new_list = "<div id='list_" + task_uuid +"' class='tile_title "+ task_uuid +"'>" + task_title + "</div>";
  $('#tiles_list').append(new_list).css('display', 'block');
}

$.fn.currentdate = function(){
  var currentdate = new Date();
  return (currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear());
}

var data = {
  set: function(key, value) {
    if (!key || !value) {return;}

    if (typeof value == "object") {
      value = JSON.stringify(value);
    }
    localStorage.setItem(key, value);
  },
  get: function(key) {
    var value = localStorage.getItem(key);

    if (!value) {return;}

    // assume it is an object that has been stringified
    if (value[0] == "{") {
      value = JSON.parse(value);
    }

    return value;
  }
}

$(document).ready(function(){
  
  //Filter 
  $("#datepicker").datepicker({
    dateFormat: "dd/mm/yy",
    onSelect: function(dt, obj){
      var tasks = $.fn.get_tasks();
      var filter_date = dt;
      var count = 0;
      if(filter_date){
        filter_date = filter_date.split('/')
        filter_date = (parseInt(filter_date[0]).toString() + '/' + parseInt(filter_date[1]).toString() + '/' + filter_date[2]);
      }else{
        return;
      }
      
      for(var key in tasks){
        var task = $.fn.parse_obj(tasks[key]);
        if(task['created_at'] == filter_date){
          $('#' + task['id']).css('display', 'block');
          $('#list_' + task['id']).css('display', 'block');
          count += 1;
        }else{
          $('#' + task['id']).css('display', 'none');
          $('#list_' + task['id']).css('display', 'none');
        }
      }
      if(count == 0){
        $('#notfound').css('display','block');
      }else{
        $('#notfound').css('display','none');
      }
    }
  });
  
  // Browser support HTML5
  if($.fn.is_html5_storage()){
    // Notification
  }else{
    $('#html5_support').css('display','block');
  }
  
  // Color Picker
  $('#colorSelector').ColorPicker({
    color: '#ccc',
    onShow: function (colpkr) {
      $(colpkr).fadeIn(500);
      return false;
    },
    onHide: function (colpkr) {
      $(colpkr).fadeOut(500);
      return false;
    },
    onChange: function (hsb, hex, rgb) {
      $('#colorSelector div').css('backgroundColor', '#' + hex);
    }
  });
  
  
  (function($){
    
    $.fn.is_empty = function(){
      var check = this.val() == '' ? false : true
      return check;
    }
    
    // get tile id
    $.fn.get_parent_id = function(obj){
      return $(obj).parent().attr('class').split(' ')[1].toString();
    }
    
    // delete
    $.fn.delete_task = function(){
      //this.parent().remove();
      var tasks = $.fn.get_tasks();
      var uuid = $.fn.get_parent_id(this);
      delete tasks[parseInt(uuid)];
      localStorage['tasks'] = JSON.stringify(tasks);
      var targets = '.' + uuid;
      $(targets).remove();
    }
    
    // delete
    $.fn.edit_task = function(uuid, new_title){
      $('#' + 'list_' + uuid).html(new_title);
      var tasks = $.fn.get_tasks();
      var task = $.fn.parse_obj(tasks[uuid]);
      task['title'] = new_title;
      tasks[uuid] = JSON.stringify(task);
      localStorage['tasks'] = JSON.stringify(tasks);
    }

    $.fn.update_color = function(uuid, hex){
      $('#' + uuid).css('backgroundColor', '#' + hex);
      $('#list_' + uuid).css('color', '#' + hex);
      var tasks = $.fn.get_tasks();
      var task = $.fn.parse_obj(tasks[uuid]);
      task['color'] = '#'+hex;
      tasks[uuid] = JSON.stringify(task);
      localStorage['tasks'] = JSON.stringify(tasks);
    }
    
    $.fn.bind_delete = function(){
      $('.close').click(function(){
        $(this).delete_task();
      })
    }
    
    $.fn.bind_inline_editor = function(){
      $('.edit').editable(function(value, settings) {
        var check = is_duplicate(value);
        if(false){
          return false;
        }else{
          $.fn.edit_task($.fn.get_parent_id(this), value);
          return(value);
        }
      });
    }
   
  })(jQuery);
  
  //local storage implementation
  if(!localStorage['tasks']){
    localStorage['uuid'] = 0;
    localStorage['tasks'] = JSON.stringify({});
  }else{
    var task_objs = $.fn.get_tasks();
    for(var key in task_objs){
      var task = $.fn.parse_obj(task_objs[key]);
      var task_uuid = task['id'];
      var task_title = task['title'];
      var task_created_at = task['created_at'];
      var task_color = task['color'];
      
      $.fn.create_tile(task_uuid, task_title, task_color, task_created_at)
      $.fn.create_tile_list(task_uuid.toString(), task_title);
      
    }
    
    // Events
    $.fn.bind_delete();
    $.fn.bind_inline_editor();
    
   // Color Picker
    $('.tilebox').click(function(){
      var uuid = $(this).attr('class').split(' ')[1];
      $('#'+uuid.toString()).ColorPicker({
        onChange: function (hsb, hex, rgb) {
          //$('#'+uuid.toString()).css('backgroundColor', '#' + hex);
          $.fn.update_color(uuid.toString(), hex);
        }
      });
    })
    
  }
                
  // show notification
  function show_notification(txt){
    $('.notification').html(txt);
    $('.notification').css('display','block');
  }
  
  //Duplicate Check
  function is_duplicate(task){
    var tasks = $.fn.task_index();
    var check = tasks.indexOf(task);
    check = check == -1 ? false : tasks[check];
    return check;
  };
  
  //if tiles is empty, get it hidden
  if($('#tiles_container').children().length == 0){
    $('#tiles_container').css('display', 'none');
    $('#tiles_list').css('display', 'none'); 
  }else{
    //create list right here
  }
  
  // Underscorised String
  function underscore(task){
    var arr = task.trim().toLowerCase().split(' ');
    var new_array = [];
    for(var i = 0; i < arr.length; i++){
      if(arr[i]){
        new_array.push(arr[i])
      }
    }
    return new_array.join('_');
  }
  
  // Create Task
  $("#btn_create").click(function(){
    var task = $("#txt_task").val().trim();
    if($("#txt_task").is_empty()){
      if(is_duplicate(task)){
        show_notification("Task already taken!");
      }else{
        // local storage
        var uuid_s = localStorage['uuid']; 
        var uuid_i = parseInt(uuid_s) + 1;
        localStorage['uuid'] = uuid_i;
        uuid_s = uuid_i.toString();
        var dt = $.fn.currentdate();
        var tasks = $.fn.get_tasks();
        var h = {
            'id':  uuid_i, 
            'title': task, 
            'created_at': dt, 
            'color': 'teal'
          }
        tasks[uuid_s] = JSON.stringify(h);
        localStorage['tasks'] = JSON.stringify(tasks);
        
        var inline_boxes = 4;
        var children_length = $('#tiles_container').children('.tilebox').length + 1;
        if((children_length % inline_boxes) == 0){
          //do nothing
        }
        
        $.fn.create_tile(uuid_s, task, 'teal', dt);
        $.fn.create_tile_list(uuid_s, task);
        
        // Events
        $.fn.bind_delete();
        $.fn.bind_inline_editor();
        
        // Color Picker
        $('.tilebox').ColorPicker({
          onChange: function (hsb, hex, rgb) {
            $.fn.update_color(uuid_s, hex);
          }
        });
      }
    }else{
      show_notification("Please enter a task!");
    }
  });
  
});