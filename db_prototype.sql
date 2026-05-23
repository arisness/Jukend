--
-- PostgreSQL database dump
--

\restrict PTjx6l1aLsn73T8yXTu05gnvjsbmJZnL5ozD4r6uUD3HvSlGXcDmW4j2znKwldn

-- Dumped from database version 17.9 (Ubuntu 17.9-0ubuntu0.25.10.1)
-- Dumped by pg_dump version 18.4 (Ubuntu 18.4-0ubuntu0.26.04.1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: security; Type: SCHEMA; Schema: -; Owner: postgres
--

CREATE SCHEMA security;


ALTER SCHEMA security OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: component; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.component (
    component_id integer NOT NULL,
    component_name character varying NOT NULL
);


ALTER TABLE security.component OWNER TO postgres;

--
-- Name: component_component_id_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

CREATE SEQUENCE security.component_component_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE security.component_component_id_seq OWNER TO postgres;

--
-- Name: component_component_id_seq; Type: SEQUENCE OWNED BY; Schema: security; Owner: postgres
--

ALTER SEQUENCE security.component_component_id_seq OWNED BY security.component.component_id;


--
-- Name: method; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.method (
    method_id integer NOT NULL,
    method_name character varying NOT NULL,
    fk_object_id integer NOT NULL
);


ALTER TABLE security.method OWNER TO postgres;

--
-- Name: method_method_id_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

CREATE SEQUENCE security.method_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE security.method_method_id_seq OWNER TO postgres;

--
-- Name: method_method_id_seq; Type: SEQUENCE OWNED BY; Schema: security; Owner: postgres
--

ALTER SEQUENCE security.method_method_id_seq OWNED BY security.method.method_id;


--
-- Name: method_permission; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.method_permission (
    fk_profile_id integer NOT NULL,
    fk_transaction_id integer NOT NULL
);


ALTER TABLE security.method_permission OWNER TO postgres;

--
-- Name: object; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.object (
    object_id integer NOT NULL,
    object_name character varying NOT NULL
);


ALTER TABLE security.object OWNER TO postgres;

--
-- Name: object_object_id_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

CREATE SEQUENCE security.object_object_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE security.object_object_id_seq OWNER TO postgres;

--
-- Name: object_object_id_seq; Type: SEQUENCE OWNED BY; Schema: security; Owner: postgres
--

ALTER SEQUENCE security.object_object_id_seq OWNED BY security.object.object_id;


--
-- Name: option; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.option (
    option_id integer NOT NULL,
    option_name character varying NOT NULL,
    fk_component_id integer NOT NULL,
    option_function character varying NOT NULL,
    option_params character varying[] NOT NULL,
    option_async boolean NOT NULL,
    option_generic boolean NOT NULL
);


ALTER TABLE security.option OWNER TO postgres;

--
-- Name: option_option_id_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

CREATE SEQUENCE security.option_option_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE security.option_option_id_seq OWNER TO postgres;

--
-- Name: option_option_id_seq; Type: SEQUENCE OWNED BY; Schema: security; Owner: postgres
--

ALTER SEQUENCE security.option_option_id_seq OWNED BY security.option.option_id;


--
-- Name: option_permission; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.option_permission (
    fk_profile_id integer NOT NULL,
    fk_option_id integer NOT NULL
);


ALTER TABLE security.option_permission OWNER TO postgres;

--
-- Name: profile; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.profile (
    profile_name character varying(40) NOT NULL,
    profile_id integer NOT NULL
);


ALTER TABLE security.profile OWNER TO postgres;

--
-- Name: profiles_0_profile_id_seq; Type: SEQUENCE; Schema: security; Owner: postgres
--

CREATE SEQUENCE security.profiles_0_profile_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE security.profiles_0_profile_id_seq OWNER TO postgres;

--
-- Name: profiles_0_profile_id_seq; Type: SEQUENCE OWNED BY; Schema: security; Owner: postgres
--

ALTER SEQUENCE security.profiles_0_profile_id_seq OWNED BY security.profile.profile_id;


--
-- Name: transaction; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.transaction (
    fk_method_id integer NOT NULL,
    transaction_id integer NOT NULL
);


ALTER TABLE security.transaction OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: security; Owner: postgres
--

CREATE TABLE security.users (
    users_name character varying(50) NOT NULL,
    users_password character varying(30) NOT NULL,
    fk_profile_id integer NOT NULL,
    users_email character varying NOT NULL
);


ALTER TABLE security.users OWNER TO postgres;

--
-- Name: component component_id; Type: DEFAULT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.component ALTER COLUMN component_id SET DEFAULT nextval('security.component_component_id_seq'::regclass);


--
-- Name: method method_id; Type: DEFAULT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method ALTER COLUMN method_id SET DEFAULT nextval('security.method_method_id_seq'::regclass);


--
-- Name: object object_id; Type: DEFAULT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.object ALTER COLUMN object_id SET DEFAULT nextval('security.object_object_id_seq'::regclass);


--
-- Name: option option_id; Type: DEFAULT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option ALTER COLUMN option_id SET DEFAULT nextval('security.option_option_id_seq'::regclass);


--
-- Name: profile profile_id; Type: DEFAULT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.profile ALTER COLUMN profile_id SET DEFAULT nextval('security.profiles_0_profile_id_seq'::regclass);


--
-- Data for Name: component; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.component (component_id, component_name) FROM stdin;
\.


--
-- Data for Name: method; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.method (method_id, method_name, fk_object_id) FROM stdin;
\.


--
-- Data for Name: method_permission; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.method_permission (fk_profile_id, fk_transaction_id) FROM stdin;
\.


--
-- Data for Name: object; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.object (object_id, object_name) FROM stdin;
\.


--
-- Data for Name: option; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.option (option_id, option_name, fk_component_id, option_function, option_params, option_async, option_generic) FROM stdin;
\.


--
-- Data for Name: option_permission; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.option_permission (fk_profile_id, fk_option_id) FROM stdin;
\.


--
-- Data for Name: profile; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.profile (profile_name, profile_id) FROM stdin;
\.


--
-- Data for Name: transaction; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.transaction (fk_method_id, transaction_id) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: security; Owner: postgres
--

COPY security.users (users_name, users_password, fk_profile_id, users_email) FROM stdin;
\.


--
-- Name: component_component_id_seq; Type: SEQUENCE SET; Schema: security; Owner: postgres
--

SELECT pg_catalog.setval('security.component_component_id_seq', 1, false);


--
-- Name: method_method_id_seq; Type: SEQUENCE SET; Schema: security; Owner: postgres
--

SELECT pg_catalog.setval('security.method_method_id_seq', 1, false);


--
-- Name: object_object_id_seq; Type: SEQUENCE SET; Schema: security; Owner: postgres
--

SELECT pg_catalog.setval('security.object_object_id_seq', 1, false);


--
-- Name: option_option_id_seq; Type: SEQUENCE SET; Schema: security; Owner: postgres
--

SELECT pg_catalog.setval('security.option_option_id_seq', 1, false);


--
-- Name: profiles_0_profile_id_seq; Type: SEQUENCE SET; Schema: security; Owner: postgres
--

SELECT pg_catalog.setval('security.profiles_0_profile_id_seq', 1, false);


--
-- Name: component component_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.component
    ADD CONSTRAINT component_pkey PRIMARY KEY (component_id);


--
-- Name: method_permission method_permission_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method_permission
    ADD CONSTRAINT method_permission_pkey PRIMARY KEY (fk_profile_id, fk_transaction_id);


--
-- Name: method method_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method
    ADD CONSTRAINT method_pkey PRIMARY KEY (method_id);


--
-- Name: object object_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.object
    ADD CONSTRAINT object_pkey PRIMARY KEY (object_id);


--
-- Name: option_permission option_permission_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option_permission
    ADD CONSTRAINT option_permission_pkey PRIMARY KEY (fk_profile_id, fk_option_id);


--
-- Name: option option_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option
    ADD CONSTRAINT option_pkey PRIMARY KEY (option_id);


--
-- Name: profile pk_profiles_0; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.profile
    ADD CONSTRAINT pk_profiles_0 PRIMARY KEY (profile_id);


--
-- Name: transaction transaction_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.transaction
    ADD CONSTRAINT transaction_pkey PRIMARY KEY (transaction_id);


--
-- Name: users username_pkey; Type: CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.users
    ADD CONSTRAINT username_pkey PRIMARY KEY (users_name);


--
-- Name: option fk_component; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option
    ADD CONSTRAINT fk_component FOREIGN KEY (fk_component_id) REFERENCES security.component(component_id);


--
-- Name: method fk_method; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method
    ADD CONSTRAINT fk_method FOREIGN KEY (fk_object_id) REFERENCES security.object(object_id);


--
-- Name: transaction fk_method; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.transaction
    ADD CONSTRAINT fk_method FOREIGN KEY (fk_method_id) REFERENCES security.method(method_id);


--
-- Name: option_permission fk_option; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option_permission
    ADD CONSTRAINT fk_option FOREIGN KEY (fk_option_id) REFERENCES security.option(option_id);


--
-- Name: method_permission fk_profile; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method_permission
    ADD CONSTRAINT fk_profile FOREIGN KEY (fk_profile_id) REFERENCES security.profile(profile_id);


--
-- Name: option_permission fk_profile; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.option_permission
    ADD CONSTRAINT fk_profile FOREIGN KEY (fk_profile_id) REFERENCES security.profile(profile_id);


--
-- Name: users fk_profile; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.users
    ADD CONSTRAINT fk_profile FOREIGN KEY (fk_profile_id) REFERENCES security.profile(profile_id);


--
-- Name: method_permission fk_transaction; Type: FK CONSTRAINT; Schema: security; Owner: postgres
--

ALTER TABLE ONLY security.method_permission
    ADD CONSTRAINT fk_transaction FOREIGN KEY (fk_transaction_id) REFERENCES security.transaction(transaction_id);


--
-- PostgreSQL database dump complete
--

\unrestrict PTjx6l1aLsn73T8yXTu05gnvjsbmJZnL5ozD4r6uUD3HvSlGXcDmW4j2znKwldn

