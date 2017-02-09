import {TextView} from 'tabris';

let widget: TextView;

// Properties
let alignment: 'center' | 'left' | 'right';
let lineSpacing: number;
let markupEnabled: boolean;
let maxLines: number|null;
let selectable: boolean;
let text: string;

widget.alignment = alignment;
widget.lineSpacing = lineSpacing;
widget.markupEnabled = markupEnabled;
widget.maxLines = maxLines;
widget.selectable = selectable;
widget.text = text;

alignment = widget.alignment;
lineSpacing = widget.lineSpacing;
markupEnabled = widget.markupEnabled;
maxLines = widget.maxLines;
selectable = widget.selectable;
text = widget.text;
