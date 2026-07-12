// klartext-syntax -- verified byte-for-byte identical between web and android repos.

function _synEscHtml(s){
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function _synLineWithColor(line, mainClass){
  // Color the line with mainClass, but split off a trailing ;comment so it
  // always stays the comment color instead of inheriting the command's color.
  var ci = line.indexOf(';');
  if(ci<0) return '<span class="'+mainClass+'">'+_synEscHtml(line)+'</span>';
  var codePart = line.slice(0,ci);
  var commentPart = line.slice(ci);
  var out = codePart ? '<span class="'+mainClass+'">'+_synEscHtml(codePart)+'</span>' : '';
  return out + '<span class="syn-comment">'+_synEscHtml(commentPart)+'</span>';
}

function _synHighlightLine(line, cycleState){
  var trimmed = line.replace(/^\s+/, '');
  if(trimmed===''){ cycleState.v=false; return ''; }

  // Cycle block: CYCL DEF starts it, indented Qnnn=... lines continue it,
  // CYCL CALL is always its own (and closes any open block); anything else closes it.
  if(/^CYCL\s+DEF\b/i.test(trimmed)){
    cycleState.v = true;
    return _synLineWithColor(line, 'syn-cycle');
  }
  if(/^CYCL\s+CALL\b/i.test(trimmed)){
    cycleState.v = false;
    return _synLineWithColor(line, 'syn-cycle');
  }
  if(cycleState.v && /^Q\d+\s*=/i.test(trimmed)){
    return _synLineWithColor(line, 'syn-cycle');
  }
  cycleState.v = false;

  if(/^TOOL\s+CALL\b/i.test(trimmed)){
    return _synLineWithColor(line, 'syn-tool');
  }
  if(/^LBL\s+\d+/i.test(trimmed) || /^CALL\s+LBL\b/i.test(trimmed)){
    return _synLineWithColor(line, 'syn-lbl');
  }
  if(/^;/.test(trimmed)){
    return '<span class="syn-comment">'+_synEscHtml(line)+'</span>';
  }
  var qAssign = trimmed.match(/^Q(\d+)\s*=/i);
  if(qAssign){
    var qcls0 = parseInt(qAssign[1],10) < 100 ? 'syn-qvar' : 'syn-cycle';
    return _synLineWithColor(line, qcls0);
  }

  // General line: split off a trailing inline comment, then pick out Q-number
  // tokens within the remaining code (e.g. "L X+Q2 Y-10 Z+Q1 FMAX RL").
  // Per Heidenhain convention, Q0-Q99 are free user variables (purple);
  // Q100+ are reserved by the control or by cycles (brown) — using the same
  // color for both was confusing the two completely different categories.
  var ci = line.indexOf(';');
  var codePart = ci>=0 ? line.slice(0,ci) : line;
  var commentPart = ci>=0 ? line.slice(ci) : '';
  var marked = codePart.replace(/Q(\d+)/g, function(m, numStr){
    var tag = parseInt(numStr,10) < 100 ? 'A' : 'B';
    return '\u0001'+tag+m+'\u0002';
  });
  var out = _synEscHtml(marked)
    .replace(/\u0001A/g,'<span class="syn-qvar">')
    .replace(/\u0001B/g,'<span class="syn-cycle">')
    .replace(/\u0002/g,'</span>');
  if(commentPart) out += '<span class="syn-comment">'+_synEscHtml(commentPart)+'</span>';
  return out;
}
