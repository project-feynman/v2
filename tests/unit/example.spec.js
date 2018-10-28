import { shallowMount } from '@vue/test-utils'
// import Room from '@/views/Room.vue'
import BaseButton from '@/components/reusables/BaseButton.vue'

function sum(a, b) {
	return a + b
}

test('adds 1 + 2 to equal 3', () => {
	expect(sum(1, 2)).toBe(3)
})

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
