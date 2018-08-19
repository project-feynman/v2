import Vue from 'vue'
import Router from 'vue-router'
import Login from '@/components/Login.vue'
import Subject from '@/components/Subject.vue'
import Chat from '@/components/chat/Chat.vue'
import Pset from '@/components/pset/Pset.vue'
import Profile from '@/components/profile/Profile.vue'
import AllSubjects from '@/components/AllSubjects.vue'

// lazy-loading
const Question = () => import('@/components/question/Index.vue')

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
