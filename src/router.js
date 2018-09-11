import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

// lazy-loading
// const Subject = () => import('@/views/Subject.vue')
const Pset = () => import('@/views/Pset.vue')
const Login = () => import('@/views/Login.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
// const Question = () => import('@/views/Question.vue')
// const Profile = () => import('@/views/Profile.vue')
const Journey = () => import('@/views/Journey.vue')
const Chat = () => import('@/views/Chat.vue')
const StudyGroups = () => import('@/views/StudyGroups.vue')
const ManageClasses = () => import('@/views/ManageClasses.vue')
// const MapOfStudents = () => import('@/components/reusables/MapOfStudents.vue')

export default new Router({
  mode: 'history', 
  base: process.env.BASE_URL, 
  routes: [
    {
      path: '/',
      component: Login
    },
    // {
    //   path: '/geolocation',
    //   component: MapOfStudents
    // },
    {
      path: '/subjects',
      component: Dashboard
    },
    {
      path: '/add-classes',
      component: ManageClasses
    },
    // {
    //   path: '/profile',
    //   component: Profile
    // },
    {
      path: '/chat/:room_id',
      component: Chat
    },
    {
      path: '/study-groups/:subject_id/:pset_number',
      component: StudyGroups
    },
    {
      path: '/conversation/:convo_id',
      component: Journey
    },
    // {
    //   path: '/:subject_id',
    //   component: Subject
    // },
    // {
    //   path: '/:subject_id/:pset_number',
    //   component: Pset
    // },
    // {
    //   path: '/:subject_id/:pset_number/:question_number',
    //   component: Question
    // }
  ]
})
