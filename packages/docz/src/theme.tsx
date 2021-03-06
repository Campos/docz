import * as React from 'react'
import { Fragment, SFC } from 'react'
import { ComponentType as CT } from 'react'
import { HashRouter, BrowserRouter } from 'react-router-dom'
import createReactContext from 'create-react-context'
import merge from 'deepmerge'

import { ErrorBoundary } from './components/ErrorBoundary'
import { ComponentsMap } from './components/DocPreview'

declare var BASE_URL: string

export type MSXComponent = CT<{
  components: ComponentsMap
}>

export interface MSXImport {
  default: MSXComponent
}

export interface Heading {
  depth: number
  slug: string
  value: string
}

export interface Entry {
  id: string
  filepath: string
  slug: string
  route: string
  name: string
  order: number
  menu: string | null
  headings: Heading[]
  [key: string]: any
}

export interface ThemeConfig {
  [key: string]: any
}

export type EntryMap = Record<string, Entry>
export type ImportMap = Record<string, () => Promise<MSXImport>>

export interface DataContext {
  config: ThemeConfig
  entries: EntryMap
  imports: ImportMap
}

const initialContext: DataContext = {
  config: {},
  entries: {},
  imports: {},
}

export const dataContext = createReactContext(initialContext)

const DefaultWrapper: SFC = ({ children }) => <Fragment>{children}</Fragment>

export interface ThemeProps extends DataContext {
  wrapper?: CT
  hashRouter?: boolean
  children(WrappedComponent: CT): JSX.Element
}

export type TransformFn = (config: ThemeConfig) => ThemeConfig
export type ThemeReturn = (WrappedComponent: CT) => CT<ThemeProps>

export function theme(
  initialConfig: ThemeConfig,
  transform?: TransformFn
): ThemeReturn {
  return WrappedComponent => {
    const Theme: CT<ThemeProps> = ({
      wrapper: Wrapper = DefaultWrapper,
      entries,
      imports,
      config = {},
      hashRouter = false,
    }) => {
      const Router = hashRouter ? HashRouter : BrowserRouter
      const newConfig = merge(initialConfig, config)
      const value = {
        entries,
        imports,
        config: transform ? transform(newConfig) : newConfig,
      }

      return (
        <ErrorBoundary>
          <dataContext.Provider value={value}>
            <Router basename={BASE_URL}>
              <Wrapper>
                <WrappedComponent />
              </Wrapper>
            </Router>
          </dataContext.Provider>
        </ErrorBoundary>
      )
    }

    Theme.displayName = 'DoczTheme'
    return Theme
  }
}
