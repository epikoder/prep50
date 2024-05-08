// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $api_collection_collection_ from "./routes/api/collection/[collection].ts";
import * as $collections_name_ from "./routes/collections/[name].tsx";
import * as $collections_layout from "./routes/collections/_layout.tsx";
import * as $collections_index from "./routes/collections/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $manage_collection_ from "./routes/manage/[collection].tsx";
import * as $manage_layout from "./routes/manage/_layout.tsx";
import * as $manage_index from "./routes/manage/index.tsx";
import * as $users_index from "./routes/users/index.tsx";
import * as $BackButton from "./islands/BackButton.tsx";
import * as $DeleteButton from "./islands/DeleteButton.tsx";
import * as $Icons_CollectionIcon from "./islands/Icons/CollectionIcon.tsx";
import * as $Icons_ManangeIcon from "./islands/Icons/ManangeIcon.tsx";
import * as $Icons_UserIcon from "./islands/Icons/UserIcon.tsx";
import * as $Input from "./islands/Input.tsx";
import * as $JumpPage from "./islands/JumpPage.tsx";
import * as $MediaInput from "./islands/MediaInput.tsx";
import * as $RelationInput from "./islands/RelationInput.tsx";
import * as $Search from "./islands/Search.tsx";
import * as $Select from "./islands/Select.tsx";
import * as $Table from "./islands/Table.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.ts": $_middleware,
    "./routes/api/collection/[collection].ts": $api_collection_collection_,
    "./routes/collections/[name].tsx": $collections_name_,
    "./routes/collections/_layout.tsx": $collections_layout,
    "./routes/collections/index.tsx": $collections_index,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/manage/[collection].tsx": $manage_collection_,
    "./routes/manage/_layout.tsx": $manage_layout,
    "./routes/manage/index.tsx": $manage_index,
    "./routes/users/index.tsx": $users_index,
  },
  islands: {
    "./islands/BackButton.tsx": $BackButton,
    "./islands/DeleteButton.tsx": $DeleteButton,
    "./islands/Icons/CollectionIcon.tsx": $Icons_CollectionIcon,
    "./islands/Icons/ManangeIcon.tsx": $Icons_ManangeIcon,
    "./islands/Icons/UserIcon.tsx": $Icons_UserIcon,
    "./islands/Input.tsx": $Input,
    "./islands/JumpPage.tsx": $JumpPage,
    "./islands/MediaInput.tsx": $MediaInput,
    "./islands/RelationInput.tsx": $RelationInput,
    "./islands/Search.tsx": $Search,
    "./islands/Select.tsx": $Select,
    "./islands/Table.tsx": $Table,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
