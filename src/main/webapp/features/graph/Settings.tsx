import React, { useCallback, useState } from 'react';
import {
  Icon,
  Card,
  Checkbox,
  Dropdown,
  DropdownProps
} from 'semantic-ui-react';
import { useDispatch, useSelector } from 'react-redux';

import { actions, GraphDirection, GraphType, selectors } from './slice';

type Props = {
  dot?: string;
};

const graphDirectionOptions = Object.values(GraphDirection).map(
  (direction) => ({
    text: direction,
    value: direction
  })
);

const graphTypeOptions = Object.values(GraphType).map((type) => ({
  text: type,
  value: type
}));

const Settings = ({ dot }: Props) => {
  const [open, setOpen] = useState(false);
  const dispatch = useDispatch();
  const coarsed = useSelector(selectors.getCoarsed);
  const direction = useSelector(selectors.getGraphDirection);
  const hideAggregates = useSelector(selectors.getHideAggregates);
  const type = useSelector(selectors.getGraphType);

  const toggleMenu = useCallback(() => {
    setOpen(!open);
  }, [open]);

  const toggleCoarsed = useCallback(() => {
    dispatch(actions.toggleCoarsed());
    dispatch(actions.renderGraph(dot));
  }, [dispatch, dot]);

  const toggleHideAggregates = useCallback(() => {
    dispatch(actions.toggleHideAggregates());
  }, [dispatch]);

  const setDirection = useCallback(
    (_, props: DropdownProps) => {
      dispatch(actions.setDirection(props.value as GraphDirection));
    },
    [dispatch]
  );

  const setType = useCallback(
    (_, props: DropdownProps) => {
      dispatch(actions.setType(props.value as GraphType));
    },
    [dispatch]
  );

  return (
    <div className="Settings">
      <Icon
        className="Settings-icon"
        name="settings"
        onClick={toggleMenu}
        size="big"
      />
      {open && (
        <Card className="Settings-card">
          <Card.Content header="Graph settings" />
          <Card.Content>
            <Checkbox
              checked={coarsed}
              label="Sketchy"
              onChange={toggleCoarsed}
              toggle
            />
          </Card.Content>
          <Card.Content>
            <Checkbox
              checked={hideAggregates}
              label="Hide aggregates"
              onChange={toggleHideAggregates}
              toggle
            />
          </Card.Content>
          <Card.Content className="Settings-dropdown">
            <span>Graph direction</span>
            <Dropdown
              selection
              options={graphDirectionOptions}
              value={direction}
              onChange={setDirection}
            />
          </Card.Content>
          <Card.Content className="Settings-dropdown">
            <span>Graph type</span>
            <Dropdown
              selection
              options={graphTypeOptions}
              value={type}
              onChange={setType}
            />
          </Card.Content>
        </Card>
      )}
    </div>
  );
};

export default Settings;
