import { Image } from '@tiptap/extension-image'
import { resolveWriteMarkdownResource } from '@shared/write-markdown-resource'

export type WriteLocalImageOptions = {
  /** Absolute path of the markdown file being edited; relative image
   * sources resolve against its directory. */
  getFilePath: () => string
}

/**
 * Image node that keeps the raw (usually workspace-relative) `src` attribute
 * intact for markdown serialization while displaying the resolved file:// URL
 * inside the editor.
 */
export const WriteLocalImage = Image.extend<WriteLocalImageOptions>({
  addOptions() {
    return {
      ...this.parent?.(),
      getFilePath: () => ''
    }
  },

  addNodeView() {
    return ({ node }) => {
      const dom = document.createElement('img')
      dom.className = 'write-rich-image'
      dom.alt = typeof node.attrs.alt === 'string' ? node.attrs.alt : ''
      const applySrc = (src: unknown): void => {
        const raw = typeof src === 'string' ? src : ''
        const resolved = resolveWriteMarkdownResource(raw, this.options.getFilePath() || null)
        dom.src = resolved ?? raw
        dom.dataset.rawSrc = raw
      }
      applySrc(node.attrs.src)
      return {
        dom,
        update: (updated) => {
          if (updated.type.name !== node.type.name) return false
          if (dom.dataset.rawSrc !== updated.attrs.src) applySrc(updated.attrs.src)
          dom.alt = typeof updated.attrs.alt === 'string' ? updated.attrs.alt : ''
          return true
        }
      }
    }
  }
})
