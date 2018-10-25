import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const Journey = () => import('@/views/Journey.vue')
const Chat = () => import('@/views/Chat.vue')
const StudyGroups = () => import('@/views/StudyGroups.vue')
const Whiteboard = () => import('@/components/chat/Whiteboard.vue')

export default new Router({
	mode: 'history',
	base: process.env.BASE_URL,
	routes: [
		{
			path: '/',
			component: Login
		},
		{
			path: '/paper',
			component: Whiteboard
		},
		{
			path: '/subjects',
			component: Dashboard
		},
		{
			path: '/:subject_id',
			component: StudyGroups
		},
		{
			path: '/chat/:room_id',
			component: Chat
		},
		{
			path: '/conversation/:convo_id',
			component: Journey
		}
	]
})
