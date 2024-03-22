import React from "react";

interface Props {
  editor: any;
}

const ColorPicker: React.FC<Props> = ({ editor }) => (
	<input
		type="color"
		onInput={(event: React.FormEvent<HTMLInputElement>) =>
			editor.chain().focus().setColor(event.currentTarget.value).run()
		}
		value={editor.getAttributes("TextStyle").color}
	/>
);

export default ColorPicker;