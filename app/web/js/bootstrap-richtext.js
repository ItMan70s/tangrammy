/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
var old_command = "";
var old_time = new Date();
// var editor = $(document);
(function ($) {
	'use strict';
	var readFileIntoDataUrl = function (fileInfo) {
		var loader = $.Deferred(),
			fReader = new FileReader();
		fReader.onload = function (e) {
			loader.resolve(e.target.result);
		};
		fReader.onerror = loader.reject;
		fReader.onprogress = loader.notify;
		fReader.readAsDataURL(fileInfo);
		return loader.promise();
	};
	$.fn.cleanHtml = function () {
		var html = $(this).html();
		return html && html.replace(/(<br>|\s|<div><br><\/div>|&nbsp;)*$/, '');
	};
	$.fn.wysiwyg = function (userOptions) {
		var editor = this;
		var selectedRange,
			options,
			toolbarBtnSelector,
			updateToolbar = function () {
				if (options.activeToolbarClass) {
					$(options.toolbarSelector).find(toolbarBtnSelector).each(function () {
						var command = $(this).data(options.commandRole);
						if (document.queryCommandState(command)) {
							$(this).addClass(options.activeToolbarClass);
						} else {
							$(this).removeClass(options.activeToolbarClass);
						}
					});
				}
			},
			execCommand = function (commandWithArgs, valueArg) {
				if (command == old_command) {
					if (new Date() - old_time < 100) {
						// duplicated
						return;
					}
				}
				old_command = command;
				old_time = new Date();
				var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || '');
				document.execCommand(command, 0, args);
				updateToolbar();
				var v = editor.find("[target-obj]");
				var t = editor.attr("target-obj");
				var h = editor.html();
				$(t).val(h);
				$(t).change();
			},
			bindHotkeys = function (hotKeys) {
				$.each(hotKeys, function (hotkey, command) {
					editor.keydown(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
							execCommand(command);
						}
					}).keyup(hotkey, function (e) {
						if (editor.attr('contenteditable') && editor.is(':visible')) {
							e.preventDefault();
							e.stopPropagation();
						}
					});
				});
			},
			getCurrentRange = function () {
				var sel = window.getSelection();
				if (sel.getRangeAt && sel.rangeCount) {
					return sel.getRangeAt(0);
				}
			},
			saveSelection = function () {
				selectedRange = getCurrentRange();
			},
			restoreSelection = function () {
				var selection = window.getSelection();
				if (selectedRange) {
					try {
						selection.removeAllRanges();
					} catch (ex) {
						document.body.createTextRange().select();
						document.selection.empty();
					}

					selection.addRange(selectedRange);
				}
			},
			insertFiles = function (files) {
				editor.focus();
				$.each(files, function (idx, fileInfo) {
					if (/^image\//.test(fileInfo.type)) {
						$.when(readFileIntoDataUrl(fileInfo)).done(function (dataUrl) {
							execCommand('insertimage', dataUrl);
						}).fail(function (e) {
							options.fileUploadError("file-reader", e);
						});
					} else {
						options.fileUploadError("unsupported-file-type", fileInfo.type);
					}
				});
			},
			markSelection = function (input, color) {
				restoreSelection();
				if (document.queryCommandSupported('hiliteColor')) {
					document.execCommand('hiliteColor', 0, color || 'transparent');
				}
				saveSelection();
				input.data(options.selectionMarker, color);
			},
			bindToolbar = function (toolbar, options) {
				toolbar.find(toolbarBtnSelector).click(function () {
					restoreSelection();
					editor.focus();
					execCommand($(this).data(options.commandRole));
					saveSelection();
				});
				toolbar.find('[data-toggle=dropdown]').click(restoreSelection);

				toolbar.find('input[type=text][data-' + options.commandRole + ']').on('webkitspeechchange change', function () {
					var newValue = this.value; /* ugly but prevents fake double-calls due to selection restoration */
					this.value = '';
					restoreSelection();
					if (newValue) {
						editor.focus();
						execCommand($(this).data(options.commandRole), newValue);
					}
					saveSelection();
				}).on('focus', function () {
					var input = $(this);
					if (!input.data(options.selectionMarker)) {
						markSelection(input, options.selectionColor);
						input.focus();
					}
				}).on('blur', function () {
					var input = $(this);
					if (input.data(options.selectionMarker)) {
						markSelection(input, false);
					}
				});
				toolbar.find('input[type=file][data-' + options.commandRole + ']').change(function () {
					restoreSelection();
					if (this.type === 'file' && this.files && this.files.length > 0) {
						insertFiles(this.files);
					}
					saveSelection();
					this.value = '';
				});
			},
			initFileDrops = function () {
				editor.on('dragenter dragover', false)
					.on('drop', function (e) {
						var dataTransfer = e.originalEvent.dataTransfer;
						e.stopPropagation();
						e.preventDefault();
						if (dataTransfer && dataTransfer.files && dataTransfer.files.length > 0) {
							insertFiles(dataTransfer.files);
						}
					});
			};
		options = $.extend({}, $.fn.wysiwyg.defaults, userOptions);
		toolbarBtnSelector = 'a[data-' + options.commandRole + '],button[data-' + options.commandRole + '],input[type=button][data-' + options.commandRole + ']';
		bindHotkeys(options.hotKeys);
		if (options.dragAndDropImages) {
			initFileDrops();
		}
		bindToolbar($(options.toolbarSelector), options);
		editor.attr('contenteditable', true)
			.on('mouseup keyup mouseout', function () {
				saveSelection();
				updateToolbar();
			});
		$(window).bind('touchend', function (e) {
			var isInside = (editor.is(e.target) || editor.has(e.target).length > 0),
				currentRange = getCurrentRange(),
				clear = currentRange && (currentRange.startContainer === currentRange.endContainer && currentRange.startOffset === currentRange.endOffset);
			if (!clear || isInside) {
				saveSelection();
				updateToolbar();
			}
		});
		return this;
	};
	$.fn.wysiwyg.defaults = {
		hotKeys: {
			'ctrl+b meta+b': 'bold',
			'ctrl+i meta+i': 'italic',
			'ctrl+u meta+u': 'underline',
			'ctrl+z meta+z': 'undo',
			'ctrl+y meta+y meta+shift+z': 'redo',
			'ctrl+l meta+l': 'justifyleft',
			'ctrl+r meta+r': 'justifyright',
			'ctrl+e meta+e': 'justifycenter',
			'ctrl+j meta+j': 'justifyfull',
			'shift+tab': 'outdent',
			'tab': 'indent'
		},
		toolbarSelector: '[data-role=editor-toolbar]',
		commandRole: 'edit',
		activeToolbarClass: 'btn-info',
		selectionMarker: 'edit-focus-marker',
		selectionColor: 'darkgrey',
		dragAndDropImages: true,
		fileUploadError: function (reason, detail) { console.log("File upload error", reason, detail); }
	};
}(window.jQuery));


function getCurrentRange() {
	var sel = window.getSelection();
	if (sel.getRangeAt && sel.rangeCount) {
		return sel.getRangeAt(0);
	}
}
function saveSelection() {
	selectedRange = getCurrentRange();
}
function restoreSelection() {
	var selection = window.getSelection();
	if (selectedRange) {
		try {
			selection.removeAllRanges();
		} catch (ex) {
			document.body.createTextRange().select();
			document.selection.empty();
		}

		selection.addRange(selectedRange);
	}
}
function fillOptions(input, options) {
	if (!input) return options;
	var udef = $(input).attr("options");
	if (!udef) return options;
	
	var opts = (udef + "").toJSON();
	if (!opts) return options;
	
	for (var i in opts) {
		options[i] = opts[i];
	}
	return options;
}
function bindRichText() {
	var options = {"icons": ["/img/s/b1.png", "/img/s/b2.png", "/img/s/b3.png", "/img/s/b4.png", "/img/s/b5.png", "/img/s/b6.png", "/img/s/b7.png", "/img/s/b8.png", "/img/s/f1.png", "/img/s/f2.png", "/img/s/f3.png", "/img/s/f4.png", "/img/s/f5.png", "/img/s/f6.png", "/img/s/f7.png", "/img/s/f8.png", "/img/s/os.hp.png", "/img/s/os.linux.png", "/img/s/os.redhat.png", "/img/s/os.win.png", "/img/s/s4.png", "/img/s/s5.png", "/img/s/s7.gif", "/img/s/t1.png", "/img/s/t2.png", "/img/s/t3.png", "/img/s/t4.png", "/img/s/t5.png", "/img/s/t6.png", "/img/s/t7.png", "/img/s/t8.png", "/img/add.png", "/img/copy.png", "/img/detail.png", "/img/edit.png", "/img/remove.png", "/img/search.png"]};
	
	$('.richtextline').each(function () { 
		richtextline($(this).attr("id") || $(this).attr("name"), fillOptions(this, options));
		$(this).removeClass("richtextline");
	});
	$('.richtext').each(function () { 
		richtext($(this).attr("id") || $(this).attr("name"), fillOptions(this, options));
		$(this).removeClass("richtext");
	});
	$('.richtextcode').each(function () { 
		richtextcode($(this).attr("id") || $(this).attr("name"), fillOptions(this, options));
		$(this).removeClass("richtextcode");
	});
	$('.richtextcodeline').each(function () { 
		richtextcodeline($(this).attr("id") || $(this).attr("name"), fillOptions(this, options));
		$(this).removeClass("richtextcodeline");
	});
	$('.preview').each(function () { 
		richtextpreview($(this).attr("id") || $(this).attr("name"), fillOptions(this, options));
		$(this).removeClass("preview");
	});
	
	$('.divinput').each(divinput);
	
	
	showTools(null, false);
	$(document).on("focusout", ".richtext-zone", function() {showTools(this, true, false); });
	$(document).on("click", ".richtext-zone", function() {showTools(this, true, true);});
	$(document).on("click", "input", function() {showTools(this, false);});
	$(document).on("click", "textarea", function() {showTools(this, false);});
	$(document).on("click", "select", function() {showTools(this, false);});
	$(document).on("mousedown keydown focus", "[contenteditable]", function() {showTools(this, false);});
	
	$(document).on("focus", "[target-input]", function() {
		var self = this;
		var a = $(self).html();
		var aa = $(self).attr("title");
		if ($(self).html() == $(self).attr("title")) {
			$(self).html("");
		}
	});
	$(document).on("blur", "[target-input]", function() {
		var self = this;
		var t =  $(self).attr("target-input");
		$(t).val($(self).html());
		if ($(self).html() == "") {
			$(self).html($(self).attr("title"));
		}
	});
	$(document).on("mousedown keydown mouseup keyup focus dbclick", "[contenteditable]", function() {richtext_editor = $(this);});
	$(document).on("mouseup keyup mouseout", "[contenteditable]", saveSelection);
	$(document).on("blur", "[target-obj]", function() {
//	$(document).on("blur", "[contenteditable=true]",function() {
		var t =  $(this).attr("target-obj");
		/*
		var source = id;
		var target = '#' + oid + '-v-e';
		if ($(id).attr("syncup")) {
			eval($(id).attr("syncup") + "('" + source.replace(/'/g, "\\'") + "', '" + target.replace(/'/g, "\\'") + "');");
		} else {
			$(target).html($(source).val());
		}
		*/
		if (t && $(t).val() != $(this).html()) {
			$(t).val($(this).html());
			$(t).change();
		}
	});
}
/* source codes for rich text */
$(document).ready(function(){
	bindRichText();
});


/* source codes for one-line rich text */
function divinput() {
	var self = this;
	$(self).removeClass("divinput");
	var id = $(self).attr("id") || "";
	if (id != "") {
		id = "#" + id;
	} else {
		id = $(self).attr("name") || "";
		if (id != "") {
			id = "[name='" + id + "']";
		} else {
			sqno++;
			$(self).attr("id", "divinput" + sqno);
			id = "#divinput" + sqno;
		}
	}
	$(self).hide();
	
	var placeholder = $(self).attr("placeholder") || $(self).attr("title");
	var toolbar = '<div class="editable ' + ($(self).attr("class") || '') + '" contenteditable="true" target-input="' + id + '" title="' + placeholder.replace(/"/g, '\\"') + '">' + ($(self).val() || placeholder) + '</div>\r\n';
	$(toolbar).insertAfter(id);
}

var richtext_editor = $(document);

/* source codes for one-line rich text */
function imginput(id, userOptions) {
	id = $("#" + id)[0] ? "#" + id : "[name='" + id + "']";
	$(id).wrap( "<div class='richtext-zone'></div>");
	$('<div target-obj="' + id + '" class="editable min-h34"></div>').insertBefore(id);
	$(id).hide();
	
	var toolbar = '<div class="">\r\n' + 
'<a class="btn btn-default" id="pictureBtn_uuid" data-original-title="Insert picture (or just drag &amp; drop)"><img src="/img/add.png">Select Picture\r\n' + 
'<input type="file" data-role="magic-overlay" data-target="#pictureBtn_uuid" data-edit="insertImage" accept="image/*" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 33px; height: 28px;"></a>\r\n' + 
'</div>\r\n';
	
	$(toolbar).insertAfter(id);
	var html = '<div class="message hide"></div>\r\n';
	$(html).insertAfter(id);
	var input = $($(id)[0].parentNode).find(".editable");
	input.wysiwyg(userOptions);
	input.html($(id).val());
}

/* source codes for one-line rich text */
function richtextline(id, userOptions) {
	userOptions = userOptions || {};
	userOptions["p"] = "no";
	userOptions["undo"] = "no";
	return __richtext(id, userOptions);
	
}

/* source codes for rich text */
function richtext(id, userOptions) {
	return __richtext(id, userOptions);
}

function richtextpreview(id, userOptions) {
	var oid = id;
	id = $("#" + id)[0] ? "#" + id : "[name='" + id + "']";
	var height = $(id).innerHeight();
	if (height < 10) {
		if ($(id).prop("tagName") == "TEXTAREA") {
			height = 34 + 20 * (($(id).attr("rows") || 2) -1);
		}
	}
	if (height < 34) {
		height = 34;
	}
	var von = "";
	var mon = "";
	if ($(id).attr('preview') == 'yes') {
		von = " active";
		mon = "";
	} else {
		von = "";
		mon = " active";
	}
	$(id).addClass("mvc-group-m-preview");
	$(id).wrap( '<div class="tab-content"><div class="tab-pane' + mon + '" id="' + oid + '-m"> </div></div>');
	
	var html = '<div class="switch-icon">\r\n' + 
			'	<a class="btn' + von + '" href="#' + oid + '-v" data-toggle="tab">view</a>\r\n' + 
			'	<a class="btn' + mon + '" href="#' + oid + '-m" data-toggle="tab">code</a>\r\n' + 
			'</div>\r\n' + 
			'<div class="tab-pane' + von + '" id="' + oid + '-v" ><div id="' + oid + '-v-e" class="form-control" style="height: ' + height + 'px;overflow-y: scroll;" title="' + ($(id).attr("title") || $(id).attr("placeholder") || "") + '"></div>\r\n' + 
			'</div>\r\n';
	$(html).insertBefore('#' + oid + '-m');
	html = '<div class="message hide"></div>\r\n';
	$(html).insertAfter('#' + oid + '-m');
	
	function syncup() {
		var source = id;
		var target = '#' + oid + '-v-e';
		if ($(id).attr("onview") && $(id).attr("onview").length > 0) {
			eval($(id).attr("onview") + "('" + source.replace(/'/g, "\\'") + "', '" + target.replace(/'/g, "\\'") + "');");
		} else {
			$(target).html($(source).val());
		}
	}
	$(document).on("blur", id, syncup);
	syncup();
}
function richtextcodeline(id, userOptions) {
	userOptions = userOptions || {};
	userOptions["p"] = "no";
	userOptions["img"] = "no";
	userOptions["undo"] = "no";
	userOptions["clear"] = "no";
	return richtextcode(id, userOptions);
}

function richtextcode(id, userOptions) {
	var oid = id;
	id = $("#" + id)[0] ? "#" + id : "[name='" + id + "']";
	var height = $(id).innerHeight();
	if (height < 34) {
		height = 34;
	}
	
	$(id).addClass("mvc-group-m");
	$(id).wrap( '<div class="richtext-zone tab-content"><div class="tab-pane" id="' + oid + '-m"> </div></div>');
	
	var html = '<div class="switch-icon">\r\n' + 
			'	<a class="btn active" href="#' + oid + '-v" data-toggle="tab">view</a>\r\n' + 
			'	<a class="btn" href="#' + oid + '-m" data-toggle="tab">code</a>\r\n' + 
			'</div>\r\n' + 
			'<div class="tab-pane mvc-group-v active" id="' + oid + '-v" ><div id="' + oid + '-v-e" target-obj="' + id + '" class="editable" style="height: ' + height + 'px;" title="' + ($(id).attr("title") || $(id).attr("placeholder") || "") + '"></div>\r\n' + 
			'</div>\r\n';
	$(html).insertBefore('#' + oid + '-m');
	html = '<div class="message hide"></div>\r\n';
	$(html).insertAfter('#' + oid + '-m');
	
	userOptions = userOptions || {};
	userOptions["bottom"] = "yes";
	userOptions["style"] = "z-index: 9; position: absolute; right: 15px; bottom: -34px; -moz-opacity:0.9; filter:alpha(opacity=90); opacity:0.9;";
	initRichTextToolbarBindings('#' + oid + '-v-e', userOptions);

	var input = $('#' + oid + '-v-e');
	var rtn = input.wysiwyg(userOptions);
	input.html($(id).val());
	return rtn;
}

/* source codes for rich text */
function __richtext(id, userOptions) {
	userOptions = userOptions || {};
	id = $("#" + id)[0] ? "#" + id : "[name='" + id + "']";
	var height = $(id).innerHeight();
	if (height < 34) {
		height = (userOptions["p"] == "no") ? 34 : 100;
	}
	$(id).wrap( "<div class='richtext-zone'></div>");
	$('<div target-obj="' + id + '" class="editable" style="height: ' + height + 'px;" title="' + ($(id).attr("title") || $(id).attr("placeholder") || "") + '"></div>').insertBefore(id);
	$(id).hide();
	
	userOptions["style"] = "z-index: 9; position: absolute; right: 15px; top: -3px; -moz-opacity:0.9; filter:alpha(opacity=90); opacity:0.9;";
	initRichTextToolbarBindings(id, userOptions);
	
	var html = '<div class="message hide"></div>\r\n';
	$(html).insertAfter(id);
	var input = $($(id)[0].parentNode).find(".editable");
	var rtn = input.wysiwyg(userOptions);
	input.html($(id).val());
	return rtn;
}

function showTools(zone, display, focus) {
	if (!display) {
		$(".autohide").each(function() { $(this).hide(); });
		return;
	}
	var bar = $(zone).find(".btn-toolbar");
	var target = bar.attr("data-target")
	$(".autohide").each(function() { 
		if (bar.attr("data-target") && bar.attr("data-target") != $(this).attr("data-target")) {
			$(this).hide(); 
		} else {
			if (!bar.is(":visible")) {
				bar.show();
			}
		}
	});
	var target = $(zone).find(".editable").attr("target-obj");
	$('.richtext-zone').find('.editable').each(function () { 
		if ($(this).attr("target-obj") != target) {
			$(this).attr("contenteditable", false);
		} else {
			$(this).attr("contenteditable", true);
		}
	});
	if (focus && !$(zone).find(".editable").is(":focus")) {
		$(zone).find(".editable").focus();
	}
}

var sqno = 0;
// Rich Text Functions
function initRichTextToolbarBindings(id, userOptions) {
	userOptions = userOptions || {};
	userOptions["font"] = userOptions["font"] || "yes";
	userOptions["p"] = userOptions["p"] || "yes";
	userOptions["link"] = userOptions["link"] || "yes";
	userOptions["img"] = userOptions["img"] || "yes";
	userOptions["undo"] = userOptions["undo"] || "yes";
	userOptions["clear"] = userOptions["clear"] || "yes";
	userOptions["style"] = userOptions["style"] || "";
	userOptions["sfont"] = userOptions["sfont"] || "no";
	
	userOptions["fileUploadError"] = function(reason, detail) {showRichTextError($(id).parents(".richtext-zone").find(".message"), reason, detail);}
	
	if ("toolbarSelector" in userOptions) {
		delete userOptions["toolbarSelector"];
	}
	// TODO switch options for: font style color algin list link img
	var toolbar = '' + 
'<div class="btn-toolbar ' + ((userOptions["autohide"] != "no") ? "autohide" : "") + '" data-role="editor-toolbar" data-target="' + id + '" style="' + userOptions["style"] + '">\r\n';

	if (userOptions["icons"]) {
		toolbar += '<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Icons"><img src="' + userOptions["icons"][0] + '"><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu" style="width:480px;padding:4px">\r\n' + 
'	<li> \r\n' + 
'	<div class="btn-group btn-group-sm">\r\n';
		for (var i in userOptions["icons"]) {
			toolbar += '<a class="btn btn-default" data-edit="insertimage ' + userOptions["icons"][i] + '"><img src="' + userOptions["icons"][i] + '"></a>\r\n';
		}
		toolbar += '	</div></li></ul>\r\n</div>\r\n\r\n';
	}
	if (userOptions["font"] != "no") {
		
	if (userOptions["sfont"] != "yes") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'	<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="Font" data-original-title="Font"><b><i class="icon-font"></i></b><b class="icon-caret-down"></b></a>\r\n' + 
'	<ul class="dropdown-menu"><li></li></ul>\r\n' + 
'</div>\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Font Size"><b><i class="icon-text-width"></i></b><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu">\r\n' + 
'	<li><a data-edit="fontSize 1"><font size="1">Very small</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 2"><font size="2">A bit small</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 3"><font size="3">Normal</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 4"><font size="4">Medium-large</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 5"><font size="5">Big</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 6"><font size="6">Very big</font></a></li>\r\n' + 
'	<li><a data-edit="fontSize 7"><font size="7">Maximum</font></a></li>\r\n' + 
'</ul>\r\n' + 
'</div>\r\n';
	}
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="bold" title="" data-original-title="Bold (Ctrl/Cmd+B)"><b><i class="icon-bold"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="italic" title="" data-original-title="Italic (Ctrl/Cmd+I)"><b><i class="icon-italic"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="strikethrough" title="" data-original-title="Strikethrough"><b><i class="icon-strikethrough"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="underline" title="" data-original-title="Underline (Ctrl/Cmd+U)"><b><i class="icon-underline"></i></b></a>\r\n' + 
'</div>\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Fore Color"><b style="color:blue;"><u><i class="icon-font"></i></u></b><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu fore-color" style="width:230px">\r\n' + 
'</ul>\r\n' + 
'</div>\r\n';

	if (userOptions["sfont"] != "yes") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Background Color"><b style="background-color: blue;color:silver;"><u><i class="icon-font"></i></u></b><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu Back-Color" style="width:230px;padding:2px;">\r\n' + 
'</ul>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}
	
	}
	
	if (userOptions["p"] != "no") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="indent" title="" data-original-title="Indent (Tab)"><i class="icon-indent-right"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="outdent" title="" data-original-title="Reduce indent (Shift+Tab)"><i class="icon-indent-left"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="insertunorderedlist" title="" data-original-title="Bullet list"><i class="icon-list-ul"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="insertorderedlist" title="" data-original-title="Number list"><i class="icon-list-ol"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="justifyleft" title="" data-original-title="Align Left (Ctrl/Cmd+L)"><i class="icon-align-left"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="justifycenter" title="" data-original-title="Center (Ctrl/Cmd+E)"><i class="icon-align-center"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="justifyright" title="" data-original-title="Align Right (Ctrl/Cmd+R)"><i class="icon-align-right"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="justifyfull" title="" data-original-title="Justify (Ctrl/Cmd+J)"><i class="icon-align-justify"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}
	if (userOptions["link"] != "no") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Hyperlink"><i class="icon-link"> </i></a>\r\n' + 
'<div class="dropdown-menu input-append"><input class="span2" placeholder="URL" type="text" data-edit="createLink"><button class="btn btn-default" type="button">Add</button></div>\r\n' + 
'<a class="btn btn-default" data-edit="unlink" title="" data-original-title="Remove Hyperlink"><i class="icon-link" style="text-decoration: line-through;"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}
	if (userOptions["img"] != "no") {
		sqno++;
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" title="" id="picture_uuid_' + sqno + '" data-original-title="Insert picture (or just drag &amp; drop)"><b><i class="icon-picture"> </i></b>\r\n' + 
'<input type="file" data-role="magic-overlay" data-target="#picture_uuid_' + sqno + '" data-edit="insertImage" accept="image/*" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 33px; height: 28px;"></a>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}

	if (userOptions["undo"] != "no") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="undo" title="" data-original-title="Undo (Ctrl/Cmd+Z)"><i class="icon-reply"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="redo" title="" data-original-title="Redo (Ctrl/Cmd+Y)"><i class="icon-share-alt"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}
	if (userOptions["clear"] != "no") {
	toolbar += "" + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="removeFormat" title="" data-original-title="Clear Format"><i class="icon-remove"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n';
	}
	toolbar += '</div>\r\n';
	if (userOptions["bottom"] == "yes") {
		$(toolbar).insertAfter(id);
	} else {
		$(toolbar).insertBefore(id);
	}
/*
* 宋体	SimSun	\5B8B\4F53
* 黑体	SimHei	\9ED1\4F53
* 微软雅黑	Microsoft YaHei	\5FAE\8F6F\96C5\9ED1
* 华文细黑	STHeiti Light [STXihei]	\534E\6587\7EC6\9ED1
* 华文黑体	STHeiti	\534E\6587\9ED1\4F53
*/
  var fonts = ['Serif', 'Sans', 'Arial', 'Arial Black', 'Courier', 'Courier New', 'Comic Sans MS', 'Helvetica', 'Impact', 'Lucida Grande', 'Lucida Sans', 'Tahoma', 'Times',
		'Times New Roman', 'Verdana', '\u5B8B\u4F53', '\u9ED1\u4F53', '\u5FAE\u8F6F\u96C5\u9ED1', '\u534E\u6587\u7EC6\u9ED1', '\u534E\u6587\u9ED1\u4F53'];
  $('[title=Font]').each(function() {
	var fontTarget = $(this).siblings('.dropdown-menu');
	$.each(fonts, function (idx, fontName) {
	  fontTarget.append($('<li><a data-edit="fontName ' + fontName +'" style="font-family:\''+ fontName +'\'">'+fontName + '</a></li>'));
	});
  });
  var colors = [{color: "#000000", style: "color:silver;", title: "Black"},
				{color: "#333333", style: "color:silver;", title: "Very dark gray"},
				{color: "#555555", style: "color:silver;", title: "Dark555"},
				{color: "#808080", style: "", title: "Gray"},
				{color: "#999999", style: "", title: "Medium gray"},
				{color: "#C0C0C0", style: "", title: "Silver"},
				{color: "#D3D3D3", style: "", title: "Light grey"},
				{color: "#FFFFFF", style: "", title: "White"},
				{color: "#800000", style: "color:silver;", title: "Maroon"},
				{color: "#A52A2A", style: "color:silver;", title: "Brown"},
				{color: "#FF0000", style: "", title: "Red"},
				{color: "#FF6600", style: "", title: "Orange"},
				{color: "#FF9900", style: "", title: "Amber"},
				{color: "#FFCC00", style: "", title: "Gold"},
				{color: "#FFFF00", style: "", title: "Yellow"},
				{color: "#FFFF99", style: "", title: "Light yellow"},
				{color: "#800080", style: "color:silver;", title: "Purple"},
				{color: "#9400D3", style: "color:silver;", title: "Dark violet"},
				{color: "#CC99FF", style: "", title: "Plum"},
				{color: "#FF1493", style: "", title: "Deep Pink"},
				{color: "#FF00FF", style: "", title: "Magenta"},
				{color: "#EE82EE", style: "", title: "violet"},
				{color: "#FF99CC", style: "", title: "Pink"},
				{color: "#FFCC99", style: "", title: "Peach"},
				{color: "#000080", style: "color:silver;", title: "Navy Blue"},
				{color: "#0000FF", style: "color:silver;", title: "Blue"},
				{color: "#3366FF", style: "color:silver;", title: "Royal blue"},
				{color: "#33CCCC", style: "", title: "Turquoise"},
				{color: "#00CCFF", style: "", title: "Sky blue"},
				{color: "#00FFFF", style: "", title: "Aqua"},
				{color: "#99CCFF", style: "", title: "Light sky blue"},
				{color: "#ADD8E6", style: "", title: "Light blue"},
				{color: "#003300", style: "color:silver;", title: "Dark green"},
				{color: "#008000", style: "color:silver;", title: "Green"},
				{color: "#339966", style: "color:silver;", title: "Sea green"},
				{color: "#99CC00", style: "", title: "Yellow green"},
				{color: "#ADFF2F", style: "", title: "Green Yellow "},
				{color: "#00FF00", style: "", title: "Lime"},
				{color: "#90EE90", style: "", title: "Light green"},
				{color: "#CCFFCC", style: "", title: "Pale green"}  ];
	var total = 0;
	var htmFore = "";
	var htmBack = "";
	$.each(colors, function (idx, color) {
		if (total == 0) {
			htmFore += '	<li> \r\n	<div class="">\r\n';
			htmBack += '	<li> \r\n	<div class="">\r\n';
		}
		htmFore += '	<a class="color-box" data-edit="ForeColor ' + color["color"] + '" style="background-color: ' + color["color"] + ';' + color["style"] + '" title="' + color["title"] + '">' + color["title"].charAt(0) + '</a>\r\n';
		htmBack += '	<a class="color-box" data-edit="BackColor ' + color["color"] + '" style="background-color: ' + color["color"] + ';' + color["style"] + '" title="' + color["title"] + '">' + color["title"].charAt(0) + '</a>\r\n';

		total++;
		if (total == 8) {
			htmFore += '	</div></li>\r\n';
			htmBack += '	</div></li>\r\n';
			total = 0;
		}
	});
	if (total != 0) {
		htmFore += '	</div></li>\r\n';
		htmBack += '	</div></li>\r\n';
	}
	
	htmBack += '	<li>\r\n' + 
				'	<div class="btn-group btn-group-sm">\r\n' + 
				'	<a class="color-box" data-edit="BackColor transparent" style="background-color: transparent;margin-left:200px;" title="No Color">X</a>\r\n' + 
				'	</div>\r\n' + 
				'	</li>\r\n';
  $('.fore-color').each(function() { $(this).append($(htmFore)); });
  $('.Back-Color').each(function() { $(this).append($(htmBack)); });

  $('a[title]').tooltip({container:'body'});
  $('.dropdown-menu input').click(function() {return false;}).change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');}).keydown('esc', function () {this.value='';$(this).change();});

  $('[data-role=magic-overlay]').each(function () { 
	var overlay = $(this), target = $(overlay.data('target')); 
	overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
  });
};

function showRichTextError(zone, reason, detail) {
	var msg='';
	if (reason==='unsupported-file-type') { 
		msg = "Unsupported format " + detail;
	} else {
		console.log("error uploading file", reason, detail);
	}
	zone.html('<div class="alert alert-danger"> <button type="button" class="close" data-dismiss="alert">&times;</button><strong>File upload error</strong> '+msg+' </div>');
};