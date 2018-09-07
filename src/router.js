import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// lazy-loading
const Subject = () => import('@/views/Subject.vue')
const Pset = () => import('@/views/Pset.vue')
const Login = () => import('@/views/Login.vue')
const AllSubjects = () => import('@/views/AllSubjects.vue')
const Question = () => import('@/views/Question.vue')
const Profile = () => import('@/views/Profile.vue')
const Conversation = () => import('@/views/Conversation.vue')
const Chat = () => import('@/views/Chat.vue')
const NewStudyGroup = () => import('@/views/NewStudyGroup.vue')
const AllStudyGroups = () => import('@/views/AllStudyGroups.vue')

export default new Router({
  mode: 'history', 
  base: process.env.BASE_URL, 
  routes: [
    {
      path: '/',
      component: Login
    },
    {
      path: '/study-group',
      component: NewStudyGroup
    },
    {
      path: '/subjects',
      component: AllSubjects
    },
    {
      path: '/profile',
      component: Profile
    },
    {
      path: '/chat/:room_id',
      component: Chat
    },
    {
      path: '/study-groups/:subject_id',
      component: AllStudyGroups
    },
    {
      path: '/conversation/:convo_id',
      component: Conversation
    },
    {
      path: '/:subject_id',
      component: Subject
    },
    {
      path: '/:subject_id/:pset_number',
      component: Pset
    },
    {
      path: '/:subject_id/:pset_number/:question_number',
      component: Question
    }
  ]
})
