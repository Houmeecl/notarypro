CREATE TABLE "analytics_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event_type" text NOT NULL,
	"user_id" integer,
	"document_id" integer,
	"template_id" integer,
	"course_id" integer,
	"video_call_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"trigger_type" text NOT NULL,
	"trigger_event" text,
	"trigger_schedule" text,
	"trigger_condition" jsonb,
	"action_type" text NOT NULL,
	"action_config" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "certificates" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"certificate_number" text NOT NULL,
	"issued_at" timestamp DEFAULT now(),
	CONSTRAINT "certificates_certificate_number_unique" UNIQUE("certificate_number")
);
--> statement-breakpoint
CREATE TABLE "course_contents" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"title" text NOT NULL,
	"content_type" text NOT NULL,
	"content" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"course_id" integer NOT NULL,
	"completed" boolean DEFAULT false,
	"enrolled_at" timestamp DEFAULT now(),
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "course_modules" (
	"id" serial PRIMARY KEY NOT NULL,
	"course_id" integer NOT NULL,
	"title" text NOT NULL,
	"order" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"image_url" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "crm_leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"rut" text,
	"document_type" text,
	"status" text DEFAULT 'initiated' NOT NULL,
	"source" text DEFAULT 'webapp' NOT NULL,
	"pipeline_stage" text DEFAULT 'initiated' NOT NULL,
	"last_contact_date" timestamp DEFAULT now(),
	"assigned_to_user_id" integer,
	"notes" text,
	"metadata" jsonb,
	"crm_external_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "dialogflow_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"user_id" integer,
	"session_id" text NOT NULL,
	"intent" text,
	"parameters" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"transferred_to_user_id" integer,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"last_interaction_at" timestamp DEFAULT now(),
	CONSTRAINT "dialogflow_sessions_session_id_unique" UNIQUE("session_id")
);
--> statement-breakpoint
CREATE TABLE "document_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "document_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "document_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"category_id" integer NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"html_template" text NOT NULL,
	"price" integer DEFAULT 0 NOT NULL,
	"form_schema" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"template_id" integer NOT NULL,
	"title" text NOT NULL,
	"form_data" jsonb NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"file_path" text,
	"pdf_path" text,
	"qr_code" text,
	"certifier_id" integer,
	"payment_id" text,
	"payment_amount" integer,
	"payment_status" text,
	"payment_method" text,
	"payment_timestamp" timestamp,
	"email" text,
	"receive_notifications" boolean DEFAULT false,
	"send_copy" boolean DEFAULT false,
	"signature_data" text,
	"signature_timestamp" timestamp,
	"certifier_signature_data" text,
	"certifier_signature_timestamp" timestamp,
	"rejection_reason" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"activity_type" text NOT NULL,
	"description" text NOT NULL,
	"points_earned" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "gamification_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"reward_type" text NOT NULL,
	"value" integer,
	"required_points" integer NOT NULL,
	"code" text,
	"expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "identity_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"document_id" integer NOT NULL,
	"id_photo_path" text NOT NULL,
	"selfie_path" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"certifier_id" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "leaderboard_entries" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"period" text NOT NULL,
	"period_start" timestamp NOT NULL,
	"period_end" timestamp NOT NULL,
	"score" integer DEFAULT 0 NOT NULL,
	"rank" integer NOT NULL,
	"region" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "message_templates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"content" text NOT NULL,
	"variables" jsonb,
	"is_whatsapp_template" boolean DEFAULT false NOT NULL,
	"whatsapp_template_namespace" text,
	"whatsapp_template_element_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "message_templates_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "micro_interactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"trigger_event" text NOT NULL,
	"display_message" text NOT NULL,
	"animation_data" jsonb,
	"sound_url" text,
	"visual_asset" text,
	"duration" integer,
	"points_awarded" integer DEFAULT 0,
	"required_level" integer DEFAULT 1,
	"frequency" text DEFAULT 'always',
	"cooldown_seconds" integer DEFAULT 0,
	"is_active" boolean DEFAULT true NOT NULL,
	"show_in_history" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_appointments" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"appointment_date" timestamp NOT NULL,
	"duration" integer DEFAULT 30 NOT NULL,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"notes" text,
	"location" text DEFAULT 'office' NOT NULL,
	"client_location_address" text,
	"meeting_url" text,
	"reminder_sent" boolean DEFAULT false,
	"fee_estimate" integer,
	"actual_fee" integer,
	"payment_status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_biometric_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"client_id" integer NOT NULL,
	"deed_id" integer,
	"verification_type" text NOT NULL,
	"verification_data" jsonb NOT NULL,
	"verification_result" boolean NOT NULL,
	"confidence_score" real,
	"verification_timestamp" timestamp DEFAULT now() NOT NULL,
	"ip_address" text,
	"device_info" text,
	"geo_location" text,
	"storage_reference" text,
	"expiry_date" date,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_deeds" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"protocol_book_id" integer,
	"deed_number" text NOT NULL,
	"deed_type" text NOT NULL,
	"deed_title" text NOT NULL,
	"execution_date" date NOT NULL,
	"folio" text,
	"parties" jsonb,
	"folio_count" integer DEFAULT 1,
	"digital_copy" text,
	"status" text DEFAULT 'active' NOT NULL,
	"related_deed_id" integer,
	"notes" text,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_fee_schedules" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"service_type" text NOT NULL,
	"service_name" text NOT NULL,
	"description" text,
	"base_price" integer NOT NULL,
	"variable_rate" boolean DEFAULT false,
	"variable_factor" text,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"registry_number" text NOT NULL,
	"license_number" text NOT NULL,
	"jurisdiction" text NOT NULL,
	"office_address" text NOT NULL,
	"office_phone" text NOT NULL,
	"office_email" text NOT NULL,
	"website" text,
	"bio" text,
	"specializations" jsonb,
	"service_area" jsonb,
	"is_active" boolean DEFAULT true,
	"verification_status" text DEFAULT 'pending' NOT NULL,
	"profile_image_url" text,
	"digital_signature_id" text,
	"digital_signature_expiry" date,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "notary_profiles_registry_number_unique" UNIQUE("registry_number"),
	CONSTRAINT "notary_profiles_license_number_unique" UNIQUE("license_number")
);
--> statement-breakpoint
CREATE TABLE "notary_protocol_books" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"year" integer NOT NULL,
	"book_number" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date,
	"total_documents" integer DEFAULT 0,
	"status" text DEFAULT 'active' NOT NULL,
	"physical_location" text,
	"digital_backup_url" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "notary_registry_connections" (
	"id" serial PRIMARY KEY NOT NULL,
	"notary_id" integer NOT NULL,
	"registry_name" text NOT NULL,
	"api_endpoint" text NOT NULL,
	"api_credential_id" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"last_sync_timestamp" timestamp,
	"error_message" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_bank_details" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"bank" text NOT NULL,
	"account_type" text NOT NULL,
	"account_number" text NOT NULL,
	"rut" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"payment_date" timestamp NOT NULL,
	"payment_method" text NOT NULL,
	"reference" text,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"document_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"commission" integer NOT NULL,
	"commission_rate" real NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"paid_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "partner_stores" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" integer NOT NULL,
	"name" text NOT NULL,
	"address" text NOT NULL,
	"store_code" text NOT NULL,
	"commission_rate" real DEFAULT 0.1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"last_login_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "partner_stores_store_code_unique" UNIQUE("store_code")
);
--> statement-breakpoint
CREATE TABLE "partner_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"store_id" integer NOT NULL,
	"document_template_id" integer NOT NULL,
	"client_name" text NOT NULL,
	"client_email" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_document" text,
	"amount" integer NOT NULL,
	"commission" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"processing_code" text NOT NULL,
	"completed_at" timestamp,
	"payment_method" text,
	"payment_reference" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "partner_transactions_processing_code_unique" UNIQUE("processing_code")
);
--> statement-breakpoint
CREATE TABLE "partners" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"store_name" text NOT NULL,
	"manager_name" text NOT NULL,
	"region" text NOT NULL,
	"commune" text NOT NULL,
	"address" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"has_internet" boolean NOT NULL,
	"has_device" boolean NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"notes" text,
	"pos_integrated" boolean DEFAULT false,
	"pos_provider" text,
	"pos_api_key" text,
	"pos_store_id" text,
	"pos_sales_endpoint" text,
	"last_synced_at" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "partners_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "pos_providers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text NOT NULL,
	"api_base_url" text NOT NULL,
	"api_documentation_url" text,
	"logo_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"required_fields" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pos_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"partner_id" integer NOT NULL,
	"transaction_date" timestamp NOT NULL,
	"transaction_id" text,
	"pos_reference" text,
	"amount" integer NOT NULL,
	"items" jsonb,
	"commission_amount" integer,
	"commission_rate" real,
	"synchronized" boolean DEFAULT true NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quick_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"icon" text NOT NULL,
	"threshold" integer NOT NULL,
	"metric_type" text NOT NULL,
	"reward_points" integer DEFAULT 0 NOT NULL,
	"badge_id" integer,
	"level" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_attempts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"quiz_id" integer NOT NULL,
	"score" integer NOT NULL,
	"passed" boolean NOT NULL,
	"attempted_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "quiz_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"quiz_id" integer NOT NULL,
	"question" text NOT NULL,
	"options" text NOT NULL,
	"correct_answer_index" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quizzes" (
	"id" serial PRIMARY KEY NOT NULL,
	"module_id" integer NOT NULL,
	"title" text NOT NULL,
	"passing_score" integer DEFAULT 70 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievement_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"current_value" integer DEFAULT 0 NOT NULL,
	"unlocked" boolean DEFAULT false NOT NULL,
	"unlocked_at" timestamp,
	"last_updated" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"badge_id" integer NOT NULL,
	"earned_at" timestamp DEFAULT now(),
	"showcase_order" integer
);
--> statement-breakpoint
CREATE TABLE "user_challenge_progress" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"challenge_id" integer NOT NULL,
	"progress" jsonb NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"awarded_points" integer,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_claimed_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"reward_id" integer NOT NULL,
	"claimed_at" timestamp DEFAULT now(),
	"status" text DEFAULT 'pending' NOT NULL,
	"redemption_code" text,
	"expires_at" timestamp,
	"processed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_game_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"total_points" integer DEFAULT 0 NOT NULL,
	"level" integer DEFAULT 1 NOT NULL,
	"consecutive_days" integer DEFAULT 0 NOT NULL,
	"last_active" timestamp DEFAULT now(),
	"verification_streak" integer DEFAULT 0 NOT NULL,
	"total_verifications" integer DEFAULT 0 NOT NULL,
	"rank" text DEFAULT 'Novato' NOT NULL,
	"preferences" jsonb,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "user_game_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_interaction_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"interaction_id" integer NOT NULL,
	"triggered_at" timestamp DEFAULT now(),
	"points_awarded" integer DEFAULT 0,
	"context" jsonb,
	"viewed" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	"email" text NOT NULL,
	"full_name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"business_name" text,
	"address" text,
	"region" text,
	"comuna" text,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification_badges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"image_url" text NOT NULL,
	"required_points" integer NOT NULL,
	"tier" text NOT NULL,
	"is_rare" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "verification_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"points" integer NOT NULL,
	"required_actions" jsonb NOT NULL,
	"completion_criteria" jsonb NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"difficulty_level" integer DEFAULT 1 NOT NULL,
	"image_url" text,
	"badge_image" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_call_services" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"price" integer NOT NULL,
	"duration" integer NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "video_call_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"service_id" integer NOT NULL,
	"certifier_id" integer,
	"scheduled_at" timestamp NOT NULL,
	"status" text DEFAULT 'pending_payment' NOT NULL,
	"meeting_url" text,
	"meeting_id" text,
	"meeting_password" text,
	"payment_id" text,
	"payment_amount" integer,
	"payment_status" text,
	"notes" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "whatsapp_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"lead_id" integer,
	"user_id" integer,
	"direction" text NOT NULL,
	"phone_number" text NOT NULL,
	"message_type" text DEFAULT 'text' NOT NULL,
	"content" text NOT NULL,
	"template_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"external_message_id" text,
	"metadata" jsonb,
	"sent_at" timestamp DEFAULT now(),
	"delivered_at" timestamp,
	"read_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "notary_appointments" ADD CONSTRAINT "notary_appointments_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_appointments" ADD CONSTRAINT "notary_appointments_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_biometric_verifications" ADD CONSTRAINT "notary_biometric_verifications_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_biometric_verifications" ADD CONSTRAINT "notary_biometric_verifications_client_id_users_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_biometric_verifications" ADD CONSTRAINT "notary_biometric_verifications_deed_id_notary_deeds_id_fk" FOREIGN KEY ("deed_id") REFERENCES "public"."notary_deeds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_deeds" ADD CONSTRAINT "notary_deeds_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_deeds" ADD CONSTRAINT "notary_deeds_protocol_book_id_notary_protocol_books_id_fk" FOREIGN KEY ("protocol_book_id") REFERENCES "public"."notary_protocol_books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_fee_schedules" ADD CONSTRAINT "notary_fee_schedules_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_profiles" ADD CONSTRAINT "notary_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_protocol_books" ADD CONSTRAINT "notary_protocol_books_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notary_registry_connections" ADD CONSTRAINT "notary_registry_connections_notary_id_notary_profiles_id_fk" FOREIGN KEY ("notary_id") REFERENCES "public"."notary_profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_stores" ADD CONSTRAINT "partner_stores_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_transactions" ADD CONSTRAINT "partner_transactions_store_id_partner_stores_id_fk" FOREIGN KEY ("store_id") REFERENCES "public"."partner_stores"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "partner_transactions" ADD CONSTRAINT "partner_transactions_document_template_id_document_templates_id_fk" FOREIGN KEY ("document_template_id") REFERENCES "public"."document_templates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pos_transactions" ADD CONSTRAINT "pos_transactions_partner_id_partners_id_fk" FOREIGN KEY ("partner_id") REFERENCES "public"."partners"("id") ON DELETE no action ON UPDATE no action;