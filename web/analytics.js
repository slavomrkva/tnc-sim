// Web-only anonymous product analytics. The shared core and Android app do not
// load Umami. Never add NC code, filenames, tool values, free text or user IDs
// to these events.
(function(){
  'use strict';

  var sentOnce = Object.create(null);
  var runActive = false;
  var editorUsed = false;

  function track(name, data){
    try{
      if(!window.umami || typeof window.umami.track !== 'function') return;
      if(data) window.umami.track(name, data);
      else window.umami.track(name);
    }catch(e){
      // Analytics is optional and must never affect the offline simulator.
    }
  }

  function trackOnce(key, name, data){
    if(sentOnce[key]) return;
    sentOnce[key] = true;
    track(name, data);
  }

  function qualityName(){
    return ['low', 'default', 'high'][window.VX_QUALITY] || 'default';
  }

  function lessonId(index){
    var lesson = window.LESSONS && window.LESSONS[index];
    return lesson && lesson.id !== undefined ? String(lesson.id) : '';
  }

  function wrapGlobal(name, wrapper){
    var original = window[name];
    if(typeof original !== 'function') return;
    window[name] = function(){
      return wrapper.call(this, original, arguments);
    };
  }

  // A Run blocked by validation stays out of analytics. M0 resume and repeated
  // Run clicks remain part of the same run until Stop, Reset or completion.
  wrapGlobal('onRun', function(original, args){
    var result = original.apply(this, args);
    if(window.mode === 'running' && !runActive){
      runActive = true;
      track('simulation_started', {quality: qualityName()});
    }
    return result;
  });

  wrapGlobal('onStop', function(original, args){
    var result = original.apply(this, args);
    if(window.mode === 'idle') runActive = false;
    return result;
  });

  wrapGlobal('onReset', function(original, args){
    var result = original.apply(this, args);
    runActive = false;
    return result;
  });

  wrapGlobal('advance', function(original, args){
    var before = window.mode;
    var result = original.apply(this, args);
    if(runActive && before !== 'done' && window.mode === 'done'){
      track('simulation_completed', {quality: qualityName()});
      runActive = false;
    }
    return result;
  });

  wrapGlobal('setQuality', function(original, args){
    var before = window.VX_QUALITY;
    var result = original.apply(this, args);
    // Changing quality rebuilds and resets the current simulation.
    if(window.mode !== 'running') runActive = false;
    if(window.VX_QUALITY !== before){
      track('simulation_quality_selected', {quality: qualityName()});
    }
    return result;
  });

  // Opening Tool Table is enough once per page load. A save is counted only
  // when the validated library really changed; no tool values leave the app.
  wrapGlobal('switchView', function(original, args){
    var result = original.apply(this, args);
    if(args[0] === 'tools') trackOnce('tool-table-opened', 'tool_table_opened');
    return result;
  });

  wrapGlobal('toolSave', function(original, args){
    var before = '';
    try{ before = JSON.stringify(window.toolLibrary || []); }catch(e){}
    var result = original.apply(this, args);
    var after = '';
    try{ after = JSON.stringify(window.toolLibrary || []); }catch(e){}
    if(before !== after){
      track('tool_table_saved', {action: args[0] === null ? 'add' : 'edit'});
    }
    return result;
  });

  wrapGlobal('learnOpenLesson', function(original, args){
    var id = lessonId(args[0]);
    var result = original.apply(this, args);
    if(id) track('lesson_started', {lesson_id: id});
    return result;
  });

  wrapGlobal('learnFinishLesson', function(original, args){
    var id = window.LEARN ? lessonId(window.LEARN.lesson) : '';
    var result = original.apply(this, args);
    if(id) track('lesson_completed', {lesson_id: id});
    return result;
  });

  wrapGlobal('learnHint', function(original, args){
    var id = window.LEARN ? lessonId(window.LEARN.lesson) : '';
    var task = window.LEARN ? window.LEARN.task : -1;
    var before = window.LEARN ? (window.LEARN.hint || 0) : 0;
    var result = original.apply(this, args);
    var after = window.LEARN ? (window.LEARN.hint || 0) : before;
    if(id && after > before){
      track('lesson_hint_used', {lesson_id: id, task: task + 1, level: after});
    }
    return result;
  });

  var code = document.getElementById('code');
  if(code){
    code.addEventListener('input', function(){
      if(editorUsed || (window.LEARN && window.LEARN.open)) return;
      editorUsed = true;
      track('editor_used');
    });
  }

  // triggerRefine() also runs automatically after simulation completion, so
  // only a real button click represents explicit Refine use.
  var refine = document.getElementById('refineBtnCanvas');
  if(refine){
    refine.addEventListener('click', function(){
      track('simulation_refine_used', {quality: qualityName()});
    });
  }

  window.TNC_ANALYTICS = {track: track};
})();
