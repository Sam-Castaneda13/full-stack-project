set client_min_messages to warning;

-- DANGER: this is NOT how to do it in the real world.
-- `drop schema` INSTANTLY ERASES EVERYTHING.
drop schema "public" cascade;

create schema "public";

create table "public"."users"(
  "userId"         serial,
  "username"       text not null,
  "hashedPassword" text not null,
  "image"          text,
  primary key ("userId"),
  unique ("username")
);

create table "public"."posts" (
  "postId"         serial,
  "userId"         int,
  "notes"          text not null,
  "photoUrl"       text,
  "createdAt"      timestamptz(6) not null default now(),
  "edited"         boolean,
  primary key ("postId")
);

create table "public"."likes"(
  "post"           int,
  "liked"          int,
  "disliked"       int
);

create table "public"."follow"(
  "following"      int,
  "followers"      int
);

create table "public"."comments"(
  "commentId"      serial,
  "userId"         int,
  "postId"         int,
  "commentText"    text,
  primary key ("commentId")
)
