// HTML5 Tweak
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

// Browser support HTML5?
function is_html5_storage(){
  return ('localStorage' in window) && window['localStorage'] !== null;
}

//Current Date
function current_date(){
  var currentdate = new Date();
  return (currentdate.getDate() + "/" + (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear());
}

// Paresr
$.fn.parse_obj = function(obj){
  return JSON.parse(obj)
}

function clean_tags(tags){
  if(tags){
    tags = tags.split(',');
    if(tags.length == 1 && (tags[0] == '' || tags[0] == 'Tag Me')){
      return 'Tag Me';
    }else{
      var arr = [];
      for(var i in tags){
        if(tags[i] != ''){
          arr.push("<span class='itag'>"+ tags[i].trim() +"</span>");
        }
      }
      return arr.join(' ');
    }
  }else{
    return 'Tag Me';
  }
}
//Tasks
$.fn.get_tasks = function(){
  // TODO: Implement return data.get('tasks');
  return $.fn.parse_obj(localStorage['tasks']);
}

$.fn.get_task = function(task_id){
  var tasks = $.fn.get_tasks();
  return $.fn.parse_obj(tasks[task_id]);
}

function get_all_tags(){
  var tasks = data.get('tasks');
  var arr = [];
  for(var i in tasks){
    var task = $.fn.parse_obj(tasks[i]);
    if(task.tags && task.tags != 'Tag Me' && task.tags != ''){
      var tile_tags = task.tags.split(',');
      for(var ii in tile_tags){
        var t = tile_tags[ii].trim();
        if(t != ''){ arr.push(tile_tags[ii].trim()); }
      }
    }
  }
  return uniq(arr);
}

function get_tag_content(task_id){
  var task = $.fn.get_task(task_id);
  if(task.tags == 'Tag Me' || task.tags == 'Tag Me'){
    return '';
  }else{
    var tags = task.tags.split(',');
    var arr = [];
    for(var i in tags){
      //var format_tag = "<div>";
      //format_tag += ""
    }
    return task.tags;
  }
}

function uniq(arr){
  var new_arr = [];
  for(var i in arr){
    if(arr[i].trim() != '' ){
      new_arr.push(arr[i]);
    }
  }
  return new_arr.filter(function(el,i,a){if(i==a.indexOf(el))return 1;return 0}).sort();
}

function update_tag(tag_id, new_value){
  var tasks = $.fn.get_tasks();
  var task = $.fn.parse_obj(tasks[tag_id]);
  task['tags'] = uniq(new_value.split(',')).join(',');
  tasks[tag_id] = JSON.stringify(task);
  localStorage['tasks'] = JSON.stringify(tasks);
}

// Task Length
$.fn.task_length = function(){
  return $.fn.task_titles().length;
}

//Titles
$.fn.task_titles = function(){
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

$.fn.create_tile = function(task){
  var task_uuid = task.id.toString();
  var new_tile = "<div id='"+ task_uuid +"' class='tilebox "+ task_uuid +"' style='position:relative;background-color:"+task.color+";'>";
  new_tile = new_tile + "<a href='#' class='close'>X</a>";
  new_tile = new_tile + "<div id='title_"+task_uuid+"' class='edit' style='position:relative;width:90%'>" + task.title + "</div>";
  new_tile = new_tile + "<div class='datetime'>" + task.created_at + "</div>";
  new_tile = new_tile + "<div id='tags_"+ task_uuid +"' class='tag'>"+ clean_tags(task.tags) +"</div>";
  new_tile = new_tile + "</div>";
  $('#tiles_container').append(new_tile).css( 'display', 'block');
}

$.fn.create_tile_list = function(task_uuid, task_title){
  var new_list = "<div id='list_" + task_uuid +"' class='tile_title "+ task_uuid +"'>" + task_title + "</div>";
  $('#tiles_list').append(new_list).css('display', 'block');
}

$.fn.show_all_task = function (){
  location.reload();
  $('#task_filter').val('Filter');
}

// DOM Loaded
$(document).ready(function(){
  
  $temp = [];
  
  // Browser supports HTML5?
  if(is_html5_storage()){
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
  
  //Filter 
  $("#task_filter").datepicker({
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
  
  
  (function($){
    
    $.fn.is_empty = function(){
      var check = this.val().trim() == '' ? false : true
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
    $.fn.edit_task = function(uuid, current_value, target){
      var target = target.split('_')[0];
      var tasks = $.fn.get_tasks();
      var task = $.fn.parse_obj(tasks[uuid]);
      if(target == 'title'){
        $('#' + 'list_' + uuid).html(current_value);
      }else{
        var arr = [];
        var tags = current_value.split(',');
        for(var i in tags){
          arr.push("<span class='itag'>"+ tags[i].trim() +"</span>");
        }
      }
      task[target] = current_value;
      tasks[uuid] = JSON.stringify(task);
      localStorage['tasks'] = JSON.stringify(tasks);
      if(target == 'tags'){location.reload();}
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
          $.fn.edit_task($.fn.get_parent_id(this), value, $(this).attr('id'));
          return(value);
        }
      });
    }
    
    $.fn.bind_tag_popup_old = function(){
      $('.tag').bind('click', function(e) {
        var current_tag_id = $(this).attr('id').split('_')[1];
        e.preventDefault();
        $('#popup_content').bPopup({
          position: ['30%', '30%'],
          follow: [false, false],
          modalColor: '#999',
          zIndex: 990,
          onOpen: function(){
            $('#txt_tags').val(get_tag_content(current_tag_id));
          },
          onClose: function(){
            update_tag(current_tag_id, $('#txt_tags').val());
            location.reload();
          }
        });
      });
    }
    
    $.fn.bind_tag_popup = function(){
      $('.tag').bind('click', function(e) {
        var current_tag_id = $(this).attr('id').split('_')[1];
        e.preventDefault();
        $('#popup_content').bPopup({
          position: ['30%', '30%'],
          follow: [false, false],
          modalColor: '#999',
          zIndex: 990,
          onOpen: function(){
            //$('#txt_tags').val(get_tag_content(current_tag_id));
            //$temp = get_tag_content(current_tag_id).split(',');
            $temp = [];
          },
          onClose: function(){
            //update_tag(current_tag_id, $('#txt_tags').val());
            update_tag(current_tag_id, $temp.join());
            location.reload();
          }
        });
      });
    }
   
  })(jQuery);
  
  // show notification
  function show_notification(txt){
    $('.notification').html(txt);
    $('.notification').css('display','block');
  }
  
  //Duplicate Check
  function is_duplicate(task){
    var tasks = $.fn.task_titles();
    var check = tasks.indexOf(task);
    check = check == -1 ? false : tasks[check];
    return check;
  };
  
  // Show tiles from local storage
  if(!localStorage['tasks']){
    localStorage['uuid'] = 0;
    localStorage['tasks'] = JSON.stringify({});
  }else{
    var task_objs = $.fn.get_tasks();
    for(var key in task_objs){
      var task = $.fn.parse_obj(task_objs[key]);
      $.fn.create_tile(task)
      $.fn.create_tile_list(task['id'].toString(), task['title']);
    }
    // Events
    $.fn.bind_delete();
    $.fn.bind_inline_editor();
    $.fn.bind_tag_popup();
    
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
  
  //Autocompleter
  $('input#txt_tags_old').smartAutoComplete({
    source: get_all_tags(),
    maxResults: 9
    
  });
  
  $("input#txt_tags_old").bind({
     keyIn: function(ev){
       var tag_list = ev.smartAutocompleteData.query.split(","); 
       //pass the modified query to default event
       ev.smartAutocompleteData.query = $.trim(tag_list[tag_list.length - 1]);
     },

     itemSelect: function(ev, selected_item){
      var options = $(this).smartAutoComplete();

      //get the text from selected item
      var selected_value = $(selected_item).text();
      var cur_list = $(this).val().split(","); 
      cur_list[cur_list.length - 1] = selected_value;
      $(this).val(cur_list.join(",") + ","); 

      //set item selected property
      options.setItemSelected(true);

      //hide results container
      $(this).trigger('lostFocus');
        
      //prevent default event handler from executing
      ev.preventDefault();
    },
  });
  
  $('input#txt_tags')
    .textext({
      plugins : 'tags autocomplete',
      tagsItems: [],
      html : {
        wrap: '<div class="text-core"><div class="text-wrap" style="border-radius:5px;"></div>',
        hidden: '<input id="txt_tags_id" type="hidden" name="txt_tags" value="[moin]">'
      },
      ext: {
        tags: {
          addTags: function(tags)
          {
            $temp.push(tags);
            $('.text-tags').css('margin','6px 3px');
            $.fn.textext.TextExtTags.prototype.addTags.apply(this, arguments);
          }
        }
      }
    })
    .bind('getSuggestions', function(e, data){
      var list = get_all_tags(),
          textext = $(e.target).textext()[0],
          query = (data ? data.query : '') || ''
          ;

      $(this).trigger(
          'setSuggestions', { result : textext.itemManager().filter(list, query) }
      );
    })
  ;

  //if tiles is empty, get it hidden
  if($('#tiles_container').children().length == 0){
    $('#tiles_container').css('display', 'none');
    $('#tiles_list').css('display', 'none'); 
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
        var dt = current_date();
        var tasks = $.fn.get_tasks();
        var h = {
            'id':  uuid_i, 
            'title': task, 
            'created_at': dt, 
            'color': 'teal',
            'tags': 'Tag Me'
          }
        tasks[uuid_s] = JSON.stringify(h);
        localStorage['tasks'] = JSON.stringify(tasks);
        
        var inline_boxes = 4;
        var children_length = $('#tiles_container').children('.tilebox').length + 1;
        if((children_length % inline_boxes) == 0){
          //do nothing
        }
        
        $.fn.create_tile(h);
        $.fn.create_tile_list(uuid_s, task);
        
        // Events
        $.fn.bind_delete();
        $.fn.bind_inline_editor();
        $.fn.bind_tag_popup();
        
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