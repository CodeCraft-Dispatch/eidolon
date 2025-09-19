import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import HomeView from '../HomeView.vue'

describe('HomeView Styling', () => {
  it('should render with the desktop class', () => {
    const wrapper = mount(HomeView)
    expect(wrapper.classes()).toContain('desktop')
  })
})
