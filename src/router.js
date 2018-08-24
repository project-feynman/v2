import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/views/Login.vue'
import Subject from '@/views/Subject.vue'
import Chat from '@/components/chat/Chat.vue'
import Pset from '@/views/Pset.vue'
import Profile from '@/views/Profile.vue'
import AllSubjects from '@/views/AllSubjects.vue'

// lazy-loading
const Question = () => import('@/views/Question.vue')

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      component: Login
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
