import React, {
  SyntheticEvent,
  useState,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import { Dropdown, Menu, Icon, Label } from 'semantic-ui-react';
import { SemanticCOLORS } from 'semantic-ui-react/dist/commonjs/generic';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, Link, useLocation } from 'react-router-dom';

import {
  actions as studioActions,
  selectors as studioSelectors
} from '../../features/studio/slice';
import {
  actions as architecturesActions,
  selectors as architecturesSelectors
} from '../../features/architectures/slice';
import { selectors as filtersSelectors } from '../../features/filters/slice';
import {
  actions as issuesActions,
  selectors as issuesSelectors
} from '../../features/issues/slice';
import { selectors as appSelectors } from '../../features/app/slice';
import { RoutePath, studio, overview, issues } from '../../routes';
import sharingActions from '../../features/sharing/actions';

import './style.scss';
import { ArchitectureSource } from '../../features/app/types';

enum Prefix {
  ARCHITECTURE = 'architecture_',
  DRAFT = 'draft_'
}

const issueColor: Record<string, SemanticCOLORS> = {
  blockers: 'red',
  criticals: 'orange',
  majors: 'yellow',
  minors: 'olive'
};

const Header = () => {
  const [justShared, setJustShared] = useState(false);
  const dispatch = useDispatch();
  const drafts = useSelector(studioSelectors.getDrafts);
  const currentStudioIndex = useSelector(studioSelectors.getCurrentIndex);
  const currentArchitectureIndex = useSelector(
    architecturesSelectors.getCurrentIndex
  );
  const architectures = useSelector(architecturesSelectors.getList);
  const currentArchitectureName = useSelector(
    architecturesSelectors.getCurrentName
  );
  const currentStudioName = useSelector(studioSelectors.getCurrentName);
  const componentCount = useSelector(filtersSelectors.getComponentCount);
  const issuesCount = useSelector(issuesSelectors.getCountByKey);
  const history = useHistory();
  const { pathname } = useLocation();
  const architectureSource = useSelector(appSelectors.getArchitectureSource);

  useEffect(() => {
    dispatch(issuesActions.get());
  }, [dispatch]);

  const currentItem = useMemo(() => {
    if (!architectureSource) return { name: undefined, value: undefined };
    if (architectureSource === ArchitectureSource.LOCAL)
      return {
        name: currentStudioName,
        value: `${Prefix.DRAFT}${currentStudioIndex}`
      };
    return {
      name: currentArchitectureName,
      value: `${Prefix.ARCHITECTURE}${currentArchitectureIndex}`
    };
  }, [
    architectureSource,
    currentArchitectureIndex,
    currentArchitectureName,
    currentStudioIndex,
    currentStudioName
  ]);

  const isArchitectureLocalStorage = (val: string | undefined) =>
    val?.startsWith(Prefix.DRAFT);

  const isArchitectureVersioned = (val: string | undefined) =>
    val?.startsWith(Prefix.ARCHITECTURE);

  const onSelection = (e: SyntheticEvent<HTMLElement, Event>, data: any) => {
    const val = String(data.value);
    if (isArchitectureVersioned(val)) {
      dispatch(
        architecturesActions.setIndex(Number(val.split(Prefix.ARCHITECTURE)[1]))
      );
      history.push(RoutePath.OVERVIEW);
    }
    if (isArchitectureLocalStorage(val)) {
      dispatch(studioActions.setIndex(Number(val.split(Prefix.DRAFT)[1])));
      history.push(RoutePath.DRAFT);
    }
  };

  const share = useCallback(() => {
    dispatch(sharingActions.share);
    setJustShared(true);
    setTimeout(() => {
      setJustShared(false);
    }, 5000);
  }, [dispatch]);

  const isStudioDisabled = architectureSource === ArchitectureSource.VERSIONNED;

  const totalIssueCount = Object.values(issuesCount).reduce(
    (sum, current) => sum + current.count,
    0
  );

  const staticDropdownItems = architectures.map(
    ({ name = '' }, index: number) => (
      <Dropdown.Item
        key={`${Prefix.ARCHITECTURE}${index}`}
        value={`${Prefix.ARCHITECTURE}${index}`}
        text={name}
        onClick={onSelection}
      />
    )
  );

  const draftDropdownItems = drafts.map(({ key = '' }, index: number) => (
    <Dropdown.Item
      key={`${Prefix.DRAFT}${index}`}
      value={`${Prefix.DRAFT}${index}`}
      text={key}
      onClick={onSelection}
    />
  ));

  const trigger = (
    <span className="Architecture-select">
      <Icon
        name={isArchitectureLocalStorage(currentItem.value) ? 'lab' : 'fork'}
      />
      {currentItem.name || 'Select an architecture'}
    </span>
  );

  return (
    <Menu size="massive" color="blue">
      <Menu.Item name="Lowfer" />
      <Menu.Item className="Header-name">
        <Dropdown
          onChange={onSelection}
          value={currentItem.value || ''}
          trigger={trigger}
        >
          <Dropdown.Menu>
            <Dropdown.Header icon="lab" content=" local storage" />
            {draftDropdownItems}
            <Dropdown.Divider />
            <Dropdown.Header icon="fork" content=" Versioned" />
            {staticDropdownItems}
          </Dropdown.Menu>
        </Dropdown>
      </Menu.Item>
      <Menu.Menu>
        <Link className="Header-link" to={isStudioDisabled ? '#' : studio.path}>
          <Menu.Item
            active={studio.path === pathname}
            disabled={isStudioDisabled}
          >
            {studio.label}
          </Menu.Item>
        </Link>
        <Link className="Header-link" to={overview.path}>
          <Menu.Item active={overview.path === pathname}>
            {overview.label}
            <Label>{componentCount} components</Label>
          </Menu.Item>
        </Link>
        <Link className="Header-link" to={issues.path}>
          <Menu.Item active={issues.path === pathname}>
            {issues.label}
            {issuesCount.map(({ type, count }) =>
              count === 0 ? null : (
                <Label
                  circular
                  color={issueColor[type]}
                  key={type}
                  className="Issue-labels"
                >
                  {count}
                </Label>
              )
            )}
            {totalIssueCount === 0 && <Label>none</Label>}
          </Menu.Item>
        </Link>
      </Menu.Menu>
      <Menu.Menu position="right">
        {(currentArchitectureName || currentStudioIndex !== null) && (
          <Menu.Item className="Share" key="share" onClick={share}>
            {justShared ? (
              <span className="Share-justShared">
                <Icon name="share square" />
                Link successfully copied to clipboard
              </span>
            ) : (
              <>
                <Icon name="linkify" />
                Link this view
              </>
            )}
          </Menu.Item>
        )}
      </Menu.Menu>
    </Menu>
  );
};

export default Header;
