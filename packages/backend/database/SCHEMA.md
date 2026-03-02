# Yellow House Database Schema

## Overview
The database schema supports users, groups, availability slots, invitations, and notifications for the Yellow House scheduling application.

## Tables

### users
- **id** (UUID): Unique identifier
- **email** (VARCHAR UNIQUE): User email address
- **password_hash** (VARCHAR): Hashed password
- **timezone** (VARCHAR): User's timezone (default: 'UTC')
- **verified** (BOOLEAN): Email verification status
- **created_at** (TIMESTAMP): Account creation time

### groups
- **id** (UUID): Unique identifier
- **name** (VARCHAR): Group name
- **owner_id** (UUID FK): Reference to users table
- **created_at** (TIMESTAMP): Group creation time

### group_members
- **id** (UUID): Unique identifier
- **group_id** (UUID FK): Reference to groups table
- **user_id** (UUID FK): Reference to users table
- **role** (user_role): Member role (owner, member, admin)
- **joined_at** (TIMESTAMP): When user joined the group
- **UNIQUE(group_id, user_id)**: Prevents duplicate memberships

### availability
- **id** (UUID): Unique identifier
- **user_id** (UUID FK): Reference to users table
- **group_id** (UUID FK): Reference to groups table
- **start_time** (TIMESTAMP): Availability start time
- **end_time** (TIMESTAMP): Availability end time
- **date** (DATE): Date for the availability
- **created_at** (TIMESTAMP): Creation time
- **UNIQUE(user_id, group_id, start_time, end_time, date)**: Prevents duplicate slots

### invitations
- **id** (UUID): Unique identifier
- **group_id** (UUID FK): Reference to groups table
- **token** (VARCHAR UNIQUE): Invitation token
- **status** (invitation_status): Active, used, or expired
- **expires_at** (TIMESTAMP): Expiration time
- **max_uses** (INTEGER): Maximum number of uses (default: 1)
- **used_count** (INTEGER): Current usage count
- **created_at** (TIMESTAMP): Creation time

### notifications
- **id** (UUID): Unique identifier
- **user_id** (UUID FK): Reference to users table
- **type** (notification_type): Notification type
- **group_id** (UUID FK): Reference to groups table (nullable)
- **created_at** (TIMESTAMP): Creation time

### push_subscriptions
- **id** (UUID): Unique identifier
- **user_id** (UUID FK): Reference to users table
- **subscription** (JSONB): Web push subscription data
- **created_at** (TIMESTAMP): Creation time

### token_blacklist
- **jti** (TEXT): JWT token ID (primary key)
- **expires_at** (TIMESTAMP): Token expiration time

### notifications_preferences
- **user_id** (UUID FK): Reference to users table
- **group_id** (UUID FK): Reference to groups table
- **settings_json** (JSONB): User notification preferences
- **PRIMARY KEY(user_id, group_id)**: Composite key

## Enums

### user_role
- owner
- member
- admin

### invitation_status
- active
- used
- expired

### notification_type
- group_invite
- member_joined
- member_left
- availability_update
- overlap_found

## Indexes

Performance indexes for frequently queried columns:
- users(email)
- groups(owner_id)
- group_members(group_id, user_id)
- availability(user_id, group_id, date, start_time, end_time)
- invitations(token, group_id)
- notifications(user_id, group_id)
- token_blacklist(expires_at)
- push_subscriptions(user_id)

## Foreign Keys & Cascading Deletes

All foreign keys are configured with ON DELETE CASCADE to maintain referential integrity:
- Deleting a user deletes all related groups (as owner), group memberships, availability slots, notifications, push subscriptions, and notification preferences
- Deleting a group deletes all group members, availability slots, invitations, and notification preferences for that group

## Constraints

- User email is unique
- User timezone defaults to 'UTC'
- User verification status defaults to FALSE
- Group members composite unique constraint prevents duplicate memberships
- Availability slots have composite unique constraint to prevent duplicate time slots
- Invitations have unique token constraint
