// DO NOT EDIT. This file is generated by Fresh.
// This file SHOULD be checked into source version control.
// This file is automatically updated during development when running `dev.ts`.

import * as $_404 from "./routes/_404.tsx";
import * as $_app from "./routes/_app.tsx";
import * as $_layout from "./routes/_layout.tsx";
import * as $_middleware from "./routes/_middleware.ts";
import * as $api_collection_collection_ from "./routes/api/collection/[collection].ts";
import * as $api_publish_index from "./routes/api/publish/index.ts";
import * as $api_publish_print from "./routes/api/publish/print.ts";
import * as $api_publish_question from "./routes/api/publish/question.ts";
import * as $api_publish_sub_topic from "./routes/api/publish/sub_topic.ts";
import * as $api_publish_subject from "./routes/api/publish/subject.ts";
import * as $api_publish_topic from "./routes/api/publish/topic.ts";
import * as $api_publish_walkthrough from "./routes/api/publish/walkthrough.ts";
import * as $collections_name_ from "./routes/collections/[name].tsx";
import * as $collections_layout from "./routes/collections/_layout.tsx";
import * as $collections_index from "./routes/collections/index.tsx";
import * as $index from "./routes/index.tsx";
import * as $login from "./routes/login.tsx";
import * as $manage_collection_ from "./routes/manage/[collection].tsx";
import * as $manage_layout from "./routes/manage/_layout.tsx";
import * as $manage_index from "./routes/manage/index.tsx";
import * as $partials_publish_create_topic from "./routes/partials/publish/create/topic.tsx";
import * as $publish_id_subject_id_topic_id_sub_topic_id_index from "./routes/publish/[id]/[subject_id]/[topic_id]/[sub_topic_id]/index.tsx";
import * as $publish_id_subject_id_topic_id_index from "./routes/publish/[id]/[subject_id]/[topic_id]/index.tsx";
import * as $publish_id_subject_id_index from "./routes/publish/[id]/[subject_id]/index.tsx";
import * as $publish_id_layout from "./routes/publish/[id]/_layout.tsx";
import * as $publish_id_index from "./routes/publish/[id]/index.tsx";
import * as $publish_layout from "./routes/publish/_layout.tsx";
import * as $publish_create from "./routes/publish/create.tsx";
import * as $publish_index from "./routes/publish/index.tsx";
import * as $publish_update_id_subject_id_topic_id_sub_topic_id_index from "./routes/publish/update/[id]/[subject_id]/[topic_id]/[sub_topic_id]/index.tsx";
import * as $publish_update_id_subject_id_topic_id_index from "./routes/publish/update/[id]/[subject_id]/[topic_id]/index.tsx";
import * as $publish_update_id_subject_id_index from "./routes/publish/update/[id]/[subject_id]/index.tsx";
import * as $publish_update_id_layout from "./routes/publish/update/[id]/_layout.tsx";
import * as $publish_update_id_index from "./routes/publish/update/[id]/index.tsx";
import * as $publish_walkthrough_id_ from "./routes/publish/walkthrough/[id].tsx";
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
import * as $publish_BackButtonPublish from "./islands/publish/BackButtonPublish.tsx";
import * as $publish_CreatePublsih from "./islands/publish/CreatePublsih.tsx";
import * as $publish_PublishList from "./islands/publish/PublishList.tsx";
import * as $publish_PublishTitle from "./islands/publish/PublishTitle.tsx";
import * as $publish_QuestionList from "./islands/publish/QuestionList.tsx";
import * as $publish_QuestionSelector from "./islands/publish/QuestionSelector.tsx";
import * as $publish_SubTopicList from "./islands/publish/SubTopicList.tsx";
import * as $publish_SubTopicSelector from "./islands/publish/SubTopicSelector.tsx";
import * as $publish_SubjectList from "./islands/publish/SubjectList.tsx";
import * as $publish_SubjectSelector from "./islands/publish/SubjectSelector.tsx";
import * as $publish_TopicList from "./islands/publish/TopicList.tsx";
import * as $publish_TopicSelector from "./islands/publish/TopicSelector.tsx";
import * as $publish_Walkthrough from "./islands/publish/Walkthrough.tsx";
import { type Manifest } from "$fresh/server.ts";

const manifest = {
  routes: {
    "./routes/_404.tsx": $_404,
    "./routes/_app.tsx": $_app,
    "./routes/_layout.tsx": $_layout,
    "./routes/_middleware.ts": $_middleware,
    "./routes/api/collection/[collection].ts": $api_collection_collection_,
    "./routes/api/publish/index.ts": $api_publish_index,
    "./routes/api/publish/print.ts": $api_publish_print,
    "./routes/api/publish/question.ts": $api_publish_question,
    "./routes/api/publish/sub_topic.ts": $api_publish_sub_topic,
    "./routes/api/publish/subject.ts": $api_publish_subject,
    "./routes/api/publish/topic.ts": $api_publish_topic,
    "./routes/api/publish/walkthrough.ts": $api_publish_walkthrough,
    "./routes/collections/[name].tsx": $collections_name_,
    "./routes/collections/_layout.tsx": $collections_layout,
    "./routes/collections/index.tsx": $collections_index,
    "./routes/index.tsx": $index,
    "./routes/login.tsx": $login,
    "./routes/manage/[collection].tsx": $manage_collection_,
    "./routes/manage/_layout.tsx": $manage_layout,
    "./routes/manage/index.tsx": $manage_index,
    "./routes/partials/publish/create/topic.tsx":
      $partials_publish_create_topic,
    "./routes/publish/[id]/[subject_id]/[topic_id]/[sub_topic_id]/index.tsx":
      $publish_id_subject_id_topic_id_sub_topic_id_index,
    "./routes/publish/[id]/[subject_id]/[topic_id]/index.tsx":
      $publish_id_subject_id_topic_id_index,
    "./routes/publish/[id]/[subject_id]/index.tsx":
      $publish_id_subject_id_index,
    "./routes/publish/[id]/_layout.tsx": $publish_id_layout,
    "./routes/publish/[id]/index.tsx": $publish_id_index,
    "./routes/publish/_layout.tsx": $publish_layout,
    "./routes/publish/create.tsx": $publish_create,
    "./routes/publish/index.tsx": $publish_index,
    "./routes/publish/update/[id]/[subject_id]/[topic_id]/[sub_topic_id]/index.tsx":
      $publish_update_id_subject_id_topic_id_sub_topic_id_index,
    "./routes/publish/update/[id]/[subject_id]/[topic_id]/index.tsx":
      $publish_update_id_subject_id_topic_id_index,
    "./routes/publish/update/[id]/[subject_id]/index.tsx":
      $publish_update_id_subject_id_index,
    "./routes/publish/update/[id]/_layout.tsx": $publish_update_id_layout,
    "./routes/publish/update/[id]/index.tsx": $publish_update_id_index,
    "./routes/publish/walkthrough/[id].tsx": $publish_walkthrough_id_,
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
    "./islands/publish/BackButtonPublish.tsx": $publish_BackButtonPublish,
    "./islands/publish/CreatePublsih.tsx": $publish_CreatePublsih,
    "./islands/publish/PublishList.tsx": $publish_PublishList,
    "./islands/publish/PublishTitle.tsx": $publish_PublishTitle,
    "./islands/publish/QuestionList.tsx": $publish_QuestionList,
    "./islands/publish/QuestionSelector.tsx": $publish_QuestionSelector,
    "./islands/publish/SubTopicList.tsx": $publish_SubTopicList,
    "./islands/publish/SubTopicSelector.tsx": $publish_SubTopicSelector,
    "./islands/publish/SubjectList.tsx": $publish_SubjectList,
    "./islands/publish/SubjectSelector.tsx": $publish_SubjectSelector,
    "./islands/publish/TopicList.tsx": $publish_TopicList,
    "./islands/publish/TopicSelector.tsx": $publish_TopicSelector,
    "./islands/publish/Walkthrough.tsx": $publish_Walkthrough,
  },
  baseUrl: import.meta.url,
} satisfies Manifest;

export default manifest;
