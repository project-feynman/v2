import { shallowMount, shallow, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import Room from '@/views/Room.vue'
import Paper from '@/components/room/Paper.vue'
import Whiteboard from '@/components/room/Whiteboard.vue'
import BaseButton from '@/components/reusables/BaseButton.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

// describe('Room', () => {
// 	let actions
// 	let store

// 	beforeEach(() => {
// 		actions = {
// 			actionClick: jest.fn(),
// 			actionInput: jest.fn()
// 		}
// 		store = new Vuex.Store({
// 			state: {},
// 			actions
// 		})
// 	})

// 	const build = () => {
// 		const wrapper = shallowMount(Room)

// 		return {
// 			wrapper,
// 			paper: () => wrapper.find(Paper),
// 			whiteboard: () => wrapper.find(Whiteboard)
// 		}
// 	}

// 	it('renders paper and whiteboard', () => {
// 		// arrange
// 		const wrapper = shallowMount(Room, {
// 			store,
// 			localVue
// 		})
// 		const paper = wrapper.find(Paper)
// 		const whiteboard = wrapper.find(Whiteboard)

// 		// assert
// 		expect(paper.exists()).toBe(true)
// 		expect(whiteboard.exists()).toBe(true)
// 	})
// })

describe('BaseButton', () => {
	it('renders props.msg when passed', () => {
		const wrapper = shallowMount(BaseButton)
		expect(wrapper.html()).toMatchSnapshot()
		// const msg = 'new message'
		// const wrapper = shallowMount(HelloWorld, {
		// 	propsData: { msg }
		// })
		// expect(wrapper.text()).toMatch(msg)
	})
})
