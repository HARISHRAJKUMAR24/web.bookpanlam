import PluginCard from "@/components/cards/plugin-card";
import { getAllPlugins } from "@/lib/api/plugins";
import { Plugin } from "@/types";

const Plugins = async () => {
  const plugins = await getAllPlugins();

  // Ensure plugins is always an array
  const pluginList: Plugin[] = Array.isArray(plugins)
    ? plugins
    : plugins?.data && Array.isArray(plugins.data)
    ? plugins.data
    : [];

  return (
    <div className="grid gap-5">
      <h1 className="text-2xl font-bold">Plugins</h1>

      <div className="grid grid-cols-6 gap-5">
        {pluginList.length > 0 ? (
          pluginList.map((plugin: Plugin, index: number) => (
            <PluginCard
              key={index}
              id={plugin.id}
              name={plugin.name}
              description={plugin.description}
              icon={plugin.icon}
              fieldLabel={plugin.fieldLabel}
              fieldPlaceholder={plugin.fieldPlaceholder}
            />
          ))
        ) : (
          <p className="col-span-6 text-center text-gray-600">
            No plugins found.
          </p>
        )}
      </div>
    </div>
  );
};

export default Plugins;
