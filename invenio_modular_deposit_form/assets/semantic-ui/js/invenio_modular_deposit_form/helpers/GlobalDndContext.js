// Part of invenio-modular-deposit-form
// Copyright (C) 2023-2025, MESH Research
//
// invenio-modular-deposit-form is free software; you can redistribute and/or modify it
// under the terms of the MIT License; see LICENSE file for more details.

import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export const GlobalDndContext = ({ key, children }) => {
  return (
    <DndProvider backend={HTML5Backend} key={key}>
      {children}
    </DndProvider>
  );
};
