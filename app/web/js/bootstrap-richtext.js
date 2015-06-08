/* http://github.com/mindmup/bootstrap-wysiwyg */
/*global jQuery, $, FileReader*/
/*jslint browser:true*/
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
		var editor = this,
			selectedRange,
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
				var commandArr = commandWithArgs.split(' '),
					command = commandArr.shift(),
					args = commandArr.join(' ') + (valueArg || '');
				document.execCommand(command, 0, args);
				updateToolbar();
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


/* source codes for rich text */
function richtext(id, userOptions) {
	userOptions = userOptions || {};
	userOptions["fileUploadError"] = function(reason, detail) {showRichTextError(".alert-" + id, reason, detail);}
	if ("toolbarSelector" in userOptions) {
		delete userOptions["toolbarSelector"];
	}
	
	// TODO switch options for: font style color algin list link img
	var toolbar = '<div class="alert-' + id + '"></div>\r\n' + 
'<div class="btn-toolbar" data-role="editor-toolbar" data-target="#' + id + '">\r\n' + 
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
'</div>\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="bold" title="" data-original-title="Bold (Ctrl/Cmd+B)"><b><i class="icon-bold"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="italic" title="" data-original-title="Italic (Ctrl/Cmd+I)"><b><i class="icon-italic"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="strikethrough" title="" data-original-title="Strikethrough"><b><i class="icon-strikethrough"></i></b></a>\r\n' + 
'<a class="btn btn-default" data-edit="underline" title="" data-original-title="Underline (Ctrl/Cmd+U)"><b><i class="icon-underline"></i></b></a>\r\n' + 
'</div>\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Fore Color"><b style="color:blue;"><u><i class="icon-font"></i></u></b><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu" style="width:230px">\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="ForeColor #000000" style="background-color: #000000;color:silver;" title="Black">B</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #333333" style="background-color: #333333;color:silver;" title="Very dark gray">V</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #555555" style="background-color: #555555;color:silver;" title="Dark555">D</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #808080" style="background-color: #808080;" title="Gray">G</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #999999" style="background-color: #999999;" title="Medium gray">M</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #C0C0C0" style="background-color: #C0C0C0;" title="Silver">S</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #D3D3D3" style="background-color: #D3D3D3;" title="Light grey">L</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FFFFFF" style="background-color: #FFFFFF;" title="White">W</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="btn-group btn-group-sm">\r\n' + 
'	<a class="color-box" data-edit="ForeColor #800000" style="background-color: #800000;color:silver;" title="Maroon">M</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #A52A2A" style="background-color: #A52A2A;color:silver;" title="Brown">B</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF0000" style="background-color: #FF0000;" title="Red">R</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF6600" style="background-color: #FF6600;" title="Orange">O</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF9900" style="background-color: #FF9900;" title="Amber">A</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FFCC00" style="background-color: #FFCC00;" title="Gold">G</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FFFF00" style="background-color: #FFFF00;" title="Yellow">Y</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FFFF99" style="background-color: #FFFF99;" title="Light yellow">L</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="ForeColor #800080" style="background-color: #800080;color:silver;" title="Purple">P</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #9400D3" style="background-color: #9400D3;color:silver;" title="Dark violet">D</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #CC99FF" style="background-color: #CC99FF;" title="Plum">P</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF1493" style="background-color: #FF1493;" title="Deep Pink">D</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF00FF" style="background-color: #FF00FF;" title="Magenta">M</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #EE82EE" style="background-color: #EE82EE;" title="violet">V</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FF99CC" style="background-color: #FF99CC;" title="Pink">P</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #FFCC99" style="background-color: #FFCC99;" title="Peach">P</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="ForeColor #000080" style="background-color: #000080;color:silver;" title="Navy Blue">N</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #0000FF" style="background-color: #0000FF;color:silver;" title="Blue">B</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #3366FF" style="background-color: #3366FF;color:silver;" title="Royal blue">R</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #33CCCC" style="background-color: #33CCCC;" title="Turquoise">T</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #00CCFF" style="background-color: #00CCFF;" title="Sky blue">S</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #00FFFF" style="background-color: #00FFFF;" title="Aqua">A</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #99CCFF" style="background-color: #99CCFF;" title="Light sky blue">L</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #ADD8E6" style="background-color: #ADD8E6;" title="Light blue">L</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li>\r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="ForeColor #003300" style="background-color: #003300;color:silver;" title="Dark green">D</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #008000" style="background-color: #008000;color:silver;" title="Green">G</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #339966" style="background-color: #339966;color:silver;" title="Sea green">S</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #99CC00" style="background-color: #99CC00;" title="Yellow green">Y</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #ADFF2F" style="background-color: #ADFF2F;" title="Green Yellow ">G</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #00FF00" style="background-color: #00FF00;" title="Lime">L</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #90EE90" style="background-color: #90EE90;" title="Light green">L</a>\r\n' + 
'	<a class="color-box" data-edit="ForeColor #CCFFCC" style="background-color: #CCFFCC;" title="Pale green">P</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'</ul>\r\n' + 
'</div>\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Background Color"><b style="background-color: blue;color:silver;"><u><i class="icon-font"></i></u></b><b class="icon-caret-down"></b></a>\r\n' + 
'<ul class="dropdown-menu" style="width:230px;padding:2px;">\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="BackColor #000000" style="background-color: #000000;color:silver;" title="Black">B</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #333333" style="background-color: #333333;color:silver;" title="Very dark gray">V</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #555555" style="background-color: #555555;color:silver;" title="Dark555">D</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #808080" style="background-color: #808080;" title="Gray">G</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #999999" style="background-color: #999999;" title="Medium gray">M</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #C0C0C0" style="background-color: #C0C0C0;" title="Silver">S</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #D3D3D3" style="background-color: #D3D3D3;" title="Light grey">L</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FFFFFF" style="background-color: #FFFFFF;" title="White">W</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="BackColor #800000" style="background-color: #800000;color:silver;" title="Maroon">M</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #A52A2A" style="background-color: #A52A2A;color:silver;" title="Brown">B</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF0000" style="background-color: #FF0000;" title="Red">R</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF6600" style="background-color: #FF6600;" title="Orange">O</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF9900" style="background-color: #FF9900;" title="Amber">A</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FFCC00" style="background-color: #FFCC00;" title="Gold">G</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FFFF00" style="background-color: #FFFF00;" title="Yellow">Y</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FFFF99" style="background-color: #FFFF99;" title="Light yellow">L</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="BackColor #800080" style="background-color: #800080;color:silver;" title="Purple">P</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #9400D3" style="background-color: #9400D3;color:silver;" title="Dark violet">D</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #CC99FF" style="background-color: #CC99FF;" title="Plum">P</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF1493" style="background-color: #FF1493;" title="Deep Pink">D</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF00FF" style="background-color: #FF00FF;" title="Magenta">M</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #EE82EE" style="background-color: #EE82EE;" title="violet">V</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FF99CC" style="background-color: #FF99CC;" title="Pink">P</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #FFCC99" style="background-color: #FFCC99;" title="Peach">P</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li> \r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="BackColor #000080" style="background-color: #000080;color:silver;" title="Navy Blue">N</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #0000FF" style="background-color: #0000FF;color:silver;" title="Blue">B</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #3366FF" style="background-color: #3366FF;color:silver;" title="Royal blue">R</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #33CCCC" style="background-color: #33CCCC;" title="Turquoise">T</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #00CCFF" style="background-color: #00CCFF;" title="Sky blue">S</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #00FFFF" style="background-color: #00FFFF;" title="Aqua">A</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #99CCFF" style="background-color: #99CCFF;" title="Light sky blue">L</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #ADD8E6" style="background-color: #ADD8E6;" title="Light blue">L</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'	<li>\r\n' + 
'	<div class="">\r\n' + 
'	<a class="color-box" data-edit="BackColor #003300" style="background-color: #003300;color:silver;" title="Dark green">D</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #008000" style="background-color: #008000;color:silver;" title="Green">G</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #339966" style="background-color: #339966;color:silver;" title="Sea green">S</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #99CC00" style="background-color: #99CC00;" title="Yellow green">Y</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #ADFF2F" style="background-color: #ADFF2F;" title="Green Yellow ">G</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #00FF00" style="background-color: #00FF00;" title="Lime">L</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #90EE90" style="background-color: #90EE90;" title="Light green">L</a>\r\n' + 
'	<a class="color-box" data-edit="BackColor #CCFFCC" style="background-color: #CCFFCC;" title="Pale green">P</a>\r\n' + 
'	</div>\r\n' + 
'	<div class="btn-group btn-group-sm">\r\n' + 
'	<a class="color-box" data-edit="BackColor transparent" style="background-color: transparent;margin-left:200px;" title="No Color">X</a>\r\n' + 
'	</div>\r\n' + 
'	</li>\r\n' + 
'</ul>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
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
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default dropdown-toggle" data-toggle="dropdown" title="" data-original-title="Hyperlink"><i class="icon-link"> </i></a>\r\n' + 
'<div class="dropdown-menu input-append"><input class="span2" placeholder="URL" type="text" data-edit="createLink"><button class="btn btn-default" type="button">Add</button></div>\r\n' + 
'<a class="btn btn-default" data-edit="unlink" title="" data-original-title="Remove Hyperlink"><i class="icon-link" style="text-decoration: line-through;"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" title="" id="pictureBtn_uuid" data-original-title="Insert picture (or just drag &amp; drop)"><b><i class="icon-picture"> </i></b>\r\n' + 
'<input type="file" data-role="magic-overlay" data-target="#pictureBtn_uuid" data-edit="insertImage" accept="image/*" style="opacity: 0; position: absolute; top: 0px; left: 0px; width: 37px; height: 30px;"></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="undo" title="" data-original-title="Undo (Ctrl/Cmd+Z)"><i class="icon-reply"> </i></a>\r\n' + 
'<a class="btn btn-default" data-edit="redo" title="" data-original-title="Redo (Ctrl/Cmd+Y)"><i class="icon-share-alt"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'<div class="btn-group btn-group-sm">\r\n' + 
'<a class="btn btn-default" data-edit="removeFormat" title="" data-original-title="Clear Format"><i class="icon-remove"> </i></a>\r\n' + 
'</div>\r\n' + 
'\r\n' + 
'</div>\r\n';
	$(toolbar).insertBefore("#" + id);
	var html = "<input type='hidden' id='" + id.substr("editor_".length) + "' name='" + id.substr("editor_".length) + "'><div class='alert-" + id + "'></div>";
	$(html).insertAfter("#" + id);
	initRichTextToolbarBindings();
	$("#" + id).wysiwyg(userOptions);
}

// Rich Text Functions
function initRichTextToolbarBindings() {
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
  $('a[title]').tooltip({container:'body'});
  $('.dropdown-menu input').click(function() {return false;}).change(function () {$(this).parent('.dropdown-menu').siblings('.dropdown-toggle').dropdown('toggle');}).keydown('esc', function () {this.value='';$(this).change();});

  $('[data-role=magic-overlay]').each(function () { 
	var overlay = $(this), target = $(overlay.data('target')); 
	overlay.css('opacity', 0).css('position', 'absolute').offset(target.offset()).width(target.outerWidth()).height(target.outerHeight());
  });
};

function showRichTextError(rtid, reason, detail) {
	var msg='';
	if (reason==='unsupported-file-type') { 
		msg = "Unsupported format " + detail;
	} else {
		console.log("error uploading file", reason, detail);
	}
	$(rtid).html('<div class="alert alert-danger"> <button type="button" class="close" data-dismiss="alert">&times;</button><strong>File upload error</strong> '+msg+' </div>');
};